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
}

export function generateLocalSettings(config: LocalSettingsConfig): string {
  const allowedHostsList = config.allowedHosts.map((h) => `'${h}'`).join(', ')
  const csrfOrigins = config.allowedHosts
    .flatMap((h) => [`'https://${h}'`, `'http://${h}'`])
    .join(', ')

  let emailSettings: string
  if (config.smtp) {
    emailSettings = `# Email settings - SMTP configured
MAIL_BACKEND = 'smtp'
EMAIL_HOST = '${config.smtp.server}'
EMAIL_PORT = ${config.smtp.port}
EMAIL_HOST_USER = '${config.smtp.login}'
EMAIL_HOST_PASSWORD = '${config.smtp.password ?? ''}'
EMAIL_USE_TLS = ${config.smtp.port === 587 ? 'True' : 'False'}
EMAIL_USE_SSL = ${config.smtp.port === 465 ? 'True' : 'False'}
DEFAULT_FROM_EMAIL = '${config.smtp.from}'

# Wedding site email settings
DEFAULT_WEDDING_FROM_EMAIL = '${config.smtp.from}'
DEFAULT_WEDDING_REPLY_EMAIL = '${config.smtp.from}'`
  } else {
    emailSettings = `# Email settings - not configured (emails logged to console)
MAIL_BACKEND = 'console'

# Wedding site email settings (placeholder)
DEFAULT_WEDDING_FROM_EMAIL = 'wedding@example.com'
DEFAULT_WEDDING_REPLY_EMAIL = 'wedding@example.com'`
  }

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

# Static files - collected to /data/static/ and served by nginx
STATIC_URL = '/static/'
STATIC_ROOT = '/data/static/'

${emailSettings}
`
}
