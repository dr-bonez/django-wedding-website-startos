import { writeFile } from 'node:fs/promises'
import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  uiPort,
  getAppSub,
  getNginxSub,
  generateLocalSettings,
  generateNginxConf,
} from './utils'
import { storeJson } from './fileModels/store.json'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Django Wedding Website!'))

  const store = await storeJson.read((s) => s).const(effects)

  // Resolve SMTP credentials from store
  const smtp = store?.smtp
  let smtpCredentials: T.SmtpValue | null = null

  if (smtp?.selection === 'system') {
    smtpCredentials = await sdk.getSystemSmtp(effects).const()
    if (smtpCredentials && smtp.value.customFrom) {
      smtpCredentials.from = smtp.value.customFrom
    }
  } else if (smtp?.selection === 'custom') {
    smtpCredentials = smtp.value.provider.value
  }

  // Get the actual hostnames from StartOS service interfaces
  const allowedHosts =
    (await sdk.serviceInterface
      .getOwn(effects, 'ui', (i) =>
        i?.addressInfo?.format('hostname-info').map((h) => h.hostname),
      )
      .const()) || []

  // Create Django subcontainer and write config directly to its rootfs
  const appSub = await getAppSub(effects)

  // Write localsettings.py directly to subcontainer rootfs (not a volume)
  const localSettingsContent = generateLocalSettings({
    secretKey: store?.secretKey ?? '',
    debug: true,
    allowedHosts,
    smtp: smtpCredentials,
    coupleName: store?.coupleName,
    weddingDate: store?.weddingDate,
    weddingLocation: store?.weddingLocation,
    websiteUrl: store?.websiteUrl,
    contactEmail: store?.contactEmail,
  })
  await writeFile(
    `${appSub.rootfs}/app/bigday/localsettings.py`,
    localSettingsContent,
  )

  // Create nginx subcontainer and write config
  const nginxSub = await getNginxSub(effects)
  await writeFile(
    `${nginxSub.rootfs}/etc/nginx/conf.d/default.conf`,
    generateNginxConf(),
  )

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
    .addDaemon('gunicorn', {
      subcontainer: appSub,
      exec: {
        command: [
          'gunicorn',
          'bigday.wsgi:application',
          '--bind',
          '0.0.0.0:8000',
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
        display: i18n('Gunicorn'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 8000, {
            successMessage: i18n('Gunicorn is ready'),
            errorMessage: i18n('Gunicorn is not ready'),
          }),
      },
      requires: ['migrate', 'collectstatic'],
    })
    .addDaemon('nginx', {
      subcontainer: nginxSub,
      exec: {
        command: ['nginx', '-g', 'daemon off;'],
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The wedding website is ready'),
            errorMessage: i18n('The wedding website is not ready'),
          }),
      },
      requires: ['gunicorn'],
    })
})
