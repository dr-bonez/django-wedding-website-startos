import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_0_0 = VersionInfo.of({
  version: '1.0.0:0',
  releaseNotes: 'Initial release of Django Wedding Website for StartOS',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
