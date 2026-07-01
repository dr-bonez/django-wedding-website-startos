import { T, utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 8080 as const

export function getRandomPassword(length: number = 24): string {
  return utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: length,
  })
}

// Short, typeable default token that gates the public RSVP portal (printed on
// invitations). The couple can replace it with a memorable word via the
// Configure Wedding action.
export function getRsvpToken(): string {
  return utils.getDefaultString({
    charset: 'a-z,0-9',
    len: 6,
  })
}

export function getAppSub(effects: T.Effects) {
  return sdk.SubContainer.of(
    effects,
    { imageId: 'django-wedding-website' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'django-wedding-website-sub',
  )
}

export function getNginxSub(effects: T.Effects) {
  return sdk.SubContainer.of(
    effects,
    { imageId: 'nginx' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'static',
      mountpoint: '/static',
      readonly: true,
    }),
    'nginx-sub',
  )
}

export async function getHttpInterfaceUrls(
  effects: T.Effects,
): Promise<string[]> {
  return sdk.serviceInterface
    .getOwn(effects, 'ui', (i) => i?.addressInfo?.nonLocal.format() || [])
    .const()
}

export function generateNginxConf(): string {
  return `upstream app_server {
    server 127.0.0.1:8000 fail_timeout=0;
}

server {
    listen 8080;
    server_name _;

    access_log /dev/stdout;
    error_log /dev/stderr info;

    keepalive_timeout 5;

    location /static/ {
        alias /static/;
    }

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;

        proxy_pass http://app_server;
    }
}
`
}

interface LocalSettingsConfig {
  secretKey: string
  debug: boolean
  allowedHosts: string[]
  smtp: T.SmtpValue | null
  coupleName?: string
  weddingDate?: string
  weddingLocation?: string
  websiteUrl?: string
  contactEmail?: string
  rsvpToken?: string
}

// Render an arbitrary string as a safe single-quoted Python string literal, so
// values like O'Brien or an SMTP password containing quotes/backslashes can't
// break out of (or inject code into) the localsettings.py that Django exec's.
function pyStr(value: string): string {
  const escaped = String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
  return `'${escaped}'`
}

// URL-safe charset the RSVP token is constrained to (matches the Django route
// regex and the gate). Applied wherever a token enters the pipeline so the
// stored value, the printed link, and Django's RSVP_TOKEN always agree.
export function sanitizeRsvpToken(value: string | undefined | null): string {
  return (value ?? '').replace(/[^A-Za-z0-9_-]/g, '')
}

export function generateLocalSettings(config: LocalSettingsConfig): string {
  const allowedHostsList = config.allowedHosts.map((h) => pyStr(h)).join(', ')
  const safeRsvpToken = sanitizeRsvpToken(config.rsvpToken)
  const csrfOrigins = config.allowedHosts
    .flatMap((h) => [pyStr(`https://${h}`), pyStr(`http://${h}`)])
    .join(', ')

  let emailSettings: string
  if (config.smtp) {
    emailSettings = `# Email settings - SMTP configured
MAIL_BACKEND = 'smtp'
EMAIL_HOST = ${pyStr(config.smtp.host)}
EMAIL_PORT = ${config.smtp.port}
EMAIL_HOST_USER = ${pyStr(config.smtp.username)}
EMAIL_HOST_PASSWORD = ${pyStr(config.smtp.password ?? '')}
EMAIL_USE_TLS = ${config.smtp.security === 'starttls' ? 'True' : 'False'}
EMAIL_USE_SSL = ${config.smtp.security === 'tls' ? 'True' : 'False'}
DEFAULT_FROM_EMAIL = ${pyStr(config.contactEmail ?? '')}

# Wedding site email settings
DEFAULT_WEDDING_FROM_EMAIL = ${pyStr(config.contactEmail ?? '')}
DEFAULT_WEDDING_REPLY_EMAIL = ${pyStr(config.contactEmail ?? '')}`
  } else {
    emailSettings = `# Email settings - not configured (emails logged to console)
MAIL_BACKEND = 'console'

# Wedding site email settings (placeholder)
DEFAULT_WEDDING_FROM_EMAIL = 'wedding@example.com'
DEFAULT_WEDDING_REPLY_EMAIL = 'wedding@example.com'`
  }

  return `import os

# Security settings
SECRET_KEY = ${pyStr(config.secretKey)}
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

# Static files - collected to /data/static/ and served by nginx
STATIC_URL = '/static/'
STATIC_ROOT = '/data/static/'

# Wedding details
${config.coupleName ? `BRIDE_AND_GROOM = ${pyStr(config.coupleName)}` : '# BRIDE_AND_GROOM not configured'}
${config.weddingDate ? `WEDDING_DATE = ${pyStr(config.weddingDate)}` : '# WEDDING_DATE not configured'}
${config.weddingLocation ? `WEDDING_LOCATION = ${pyStr(config.weddingLocation)}` : '# WEDDING_LOCATION not configured'}
${config.websiteUrl ? `WEDDING_WEBSITE_URL = ${pyStr(config.websiteUrl)}` : '# WEDDING_WEBSITE_URL not configured'}
${config.contactEmail ? `DEFAULT_WEDDING_EMAIL = ${pyStr(config.contactEmail)}` : '# DEFAULT_WEDDING_EMAIL not configured'}
${safeRsvpToken ? `RSVP_TOKEN = ${pyStr(safeRsvpToken)}` : '# RSVP_TOKEN not configured (RSVP portal disabled)'}

${emailSettings}
`
}
