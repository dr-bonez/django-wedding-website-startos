import { T, utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 8080 as const

export function getRandomPassword(length: number = 24): string {
  return utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: length,
  })
}

export function getAppSub(effects: T.Effects) {
  return sdk.SubContainer.of(
    effects,
    { imageId: 'django-wedding-website' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'localsettings.py',
        mountpoint: '/app/bigday/localsettings.py',
        readonly: true,
      }),
    'django-wedding-website-sub',
  )
}

interface LocalSettingsConfig {
  secretKey: string
  debug: boolean
  allowedHosts: string[]
}

export function generateLocalSettings(config: LocalSettingsConfig): string {
  const allowedHostsList = config.allowedHosts.map((h) => `'${h}'`).join(', ')
  const csrfOrigins = config.allowedHosts
    .flatMap((h) => [`'https://${h}'`, `'http://${h}'`])
    .join(', ')

  return `import os

# Security settings
SECRET_KEY = '${config.secretKey}'
DEBUG = ${config.debug ? 'True' : 'False'}

# Database configuration - use SQLite in /data for persistence
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/data/db.sqlite3',
    }
}

# Allowed hosts
ALLOWED_HOSTS = [${allowedHostsList}]

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = [${csrfOrigins}]

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = '/data/static/'

# Email settings (can be configured later)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Wedding site settings
DEFAULT_WEDDING_FROM_EMAIL = os.environ.get('WEDDING_FROM_EMAIL', 'wedding@example.com')
DEFAULT_WEDDING_REPLY_EMAIL = os.environ.get('WEDDING_REPLY_EMAIL', 'wedding@example.com')
`
}
