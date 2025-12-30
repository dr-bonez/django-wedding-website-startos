import { writeFile } from 'node:fs/promises'
import { sdk } from './sdk'
import { uiPort, getAppSub, generateLocalSettings } from './utils'
import { storeJson } from './fileModels/store.json'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting Django Wedding Website!')

  const store = await storeJson.read((s) => s).const(effects)

  // Get the actual hostnames from StartOS service interfaces
  const uiInterface = await sdk.serviceInterface.getOwn(effects, 'ui').const()
  if (!uiInterface) throw new Error('interfaces do not exist')
  const hostnames = uiInterface.addressInfo?.format('hostname-info')
  const allowedHosts = hostnames?.map((h) => h.hostname.value) ?? []

  // Write localsettings.py to the volume
  const localSettingsContent = generateLocalSettings({
    secretKey: store?.secretKey ?? '',
    debug: false,
    allowedHosts,
  })
  await writeFile(
    '/media/startos/volumes/main/localsettings.py',
    localSettingsContent,
  )

  const appSub = await getAppSub(effects)

  return sdk.Daemons.of(effects)
    .addOneshot('migrate', {
      subcontainer: appSub,
      exec: {
        command: ['python', 'manage.py', 'migrate', '--noinput'],
      },
      requires: [],
    })
    .addOneshot('collectstatic', {
      subcontainer: appSub,
      exec: {
        command: ['python', 'manage.py', 'collectstatic', '--noinput'],
      },
      requires: ['migrate'],
    })
    .addOneshot('create-superuser', {
      subcontainer: appSub,
      exec: {
        command: ['python', 'manage.py', 'createsuperuser', '--noinput'],
        env: {
          DJANGO_SUPERUSER_USERNAME: 'admin',
          DJANGO_SUPERUSER_PASSWORD: store?.adminPassword ?? '',
          DJANGO_SUPERUSER_EMAIL: 'admin@localhost',
        },
      },
      requires: ['migrate'],
    })
    .addDaemon('gunicorn', {
      subcontainer: appSub,
      exec: {
        command: [
          'gunicorn',
          'bigday.wsgi:application',
          '--bind',
          '0.0.0.0:8080',
          '--workers',
          '2',
          '--threads',
          '4',
          '--timeout',
          '120',
          '--access-logfile',
          '-',
          '--error-logfile',
          '-',
        ],
      },
      ready: {
        display: 'Web Interface',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: 'The wedding website is ready',
            errorMessage: 'The wedding website is not ready',
          }),
      },
      requires: ['migrate', 'collectstatic', 'create-superuser'],
    })
})
