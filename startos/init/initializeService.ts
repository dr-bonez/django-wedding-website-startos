import { writeFile } from 'node:fs/promises'
import { getAdminCredentials } from '../actions/getAdminCredentials'
import { sdk } from '../sdk'
import {
  getRandomPassword,
  getAppSub,
  generateLocalSettings,
} from '../utils'
import { storeJson } from '../fileModels/store.json'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const adminPassword = getRandomPassword()
  const secretKey = getRandomPassword(50)

  await storeJson.write(effects, {
    adminPassword,
    secretKey,
    smtp: { selection: 'disabled', value: {} },
  })

  // Create subcontainer for initial setup
  const appSub = await getAppSub(effects)

  // Write initial localsettings.py (will be overwritten on startup with actual hostnames)
  const localSettingsContent = generateLocalSettings({
    secretKey,
    debug: false,
    allowedHosts: ['localhost'],
    smtp: null,
  })
  await writeFile(
    `${appSub.rootfs}/app/bigday/localsettings.py`,
    localSettingsContent,
  )

  // Run migrations and create superuser during install
  await sdk.Daemons.of(effects)
    .addOneshot('migrate', {
      subcontainer: appSub,
      exec: {
        command: ['python', 'manage.py', 'migrate', '--noinput'],
      },
      requires: [],
    })
    .addOneshot('create-superuser', {
      subcontainer: appSub,
      exec: {
        command: ['python', 'manage.py', 'createsuperuser', '--noinput'],
        env: {
          DJANGO_SUPERUSER_USERNAME: 'admin',
          DJANGO_SUPERUSER_PASSWORD: adminPassword,
          DJANGO_SUPERUSER_EMAIL: 'admin@localhost',
        },
      },
      requires: ['migrate'],
    })
    .runUntilSuccess(120_000)

  await sdk.action.createOwnTask(effects, getAdminCredentials, 'critical', {
    reason:
      'Retrieve the admin password so you can manage your wedding website',
  })
})
