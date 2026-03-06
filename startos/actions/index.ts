import { sdk } from '../sdk'
import { configureWedding } from './configureWedding'
import { getAdminCredentials } from './getAdminCredentials'
import { manageSmtp } from './manageSmtp'

export const actions = sdk.Actions.of()
  .addAction(configureWedding)
  .addAction(getAdminCredentials)
  .addAction(manageSmtp)
