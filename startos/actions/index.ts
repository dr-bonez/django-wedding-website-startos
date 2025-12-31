import { sdk } from '../sdk'
import { getAdminCredentials } from './getAdminCredentials'
import { manageSmtp } from './manageSmtp'

export const actions = sdk.Actions.of()
  .addAction(getAdminCredentials)
  .addAction(manageSmtp)
