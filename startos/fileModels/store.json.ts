import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  adminPassword: z.string().optional().catch(undefined),
  secretKey: z.string().optional().catch(undefined),
  smtp: sdk.inputSpecConstants.smtpInputSpec.validator.catch({
    selection: 'disabled' as const,
    value: {},
  }),
  coupleName: z.string().optional().catch(undefined),
  weddingDate: z.string().optional().catch(undefined),
  weddingLocation: z.string().optional().catch(undefined),
  websiteUrl: z.string().optional().catch(undefined),
  contactEmail: z.string().optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
