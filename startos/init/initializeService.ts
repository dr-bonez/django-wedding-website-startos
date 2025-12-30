import { getAdminCredentials } from '../actions/getAdminCredentials'
import { sdk } from '../sdk'
import { getRandomPassword } from '../utils'
import { storeJson } from '../fileModels/store.json'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const adminPassword = getRandomPassword()
  const secretKey = getRandomPassword(50)

  await storeJson.write(effects, { adminPassword, secretKey })

  await sdk.action.createOwnTask(effects, getAdminCredentials, 'critical', {
    reason:
      'Retrieve the admin password so you can manage your wedding website',
  })
})
