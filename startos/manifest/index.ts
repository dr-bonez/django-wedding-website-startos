import { setupManifest } from '@start9labs/start-sdk'
import { short, long } from './i18n'

export const manifest = setupManifest({
  id: 'django-wedding-website',
  title: 'Django Wedding Website',
  license: 'Apache-2.0',
  packageRepo: 'https://github.com/Start9Labs/django-wedding-website-startos',
  upstreamRepo: 'https://github.com/czue/django-wedding-website',
  marketingUrl: 'https://github.com/czue/django-wedding-website',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    'django-wedding-website': {
      source: {
        dockerBuild: {
          workdir: './',
          dockerfile: 'Dockerfile',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
    nginx: {
      source: {
        dockerTag: 'nginx:alpine',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
