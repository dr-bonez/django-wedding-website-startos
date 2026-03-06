import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_0_0_0_4_b0 = VersionInfo.of({
  version: '1.0.0:0.4-beta.0',
  releaseNotes: {
    en_US: 'Initial release of Django Wedding Website for StartOS',
    es_ES: 'Lanzamiento inicial de Django Wedding Website para StartOS',
    de_DE: 'Erstveröffentlichung von Django Wedding Website für StartOS',
    pl_PL: 'Pierwsze wydanie Django Wedding Website dla StartOS',
    fr_FR: 'Version initiale de Django Wedding Website pour StartOS',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
