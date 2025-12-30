import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'django-wedding-website',
  title: 'Django Wedding Website',
  license: 'MIT',
  wrapperRepo:
    'https://github.com/Start9Labs/django-wedding-website-startos',
  upstreamRepo: 'https://github.com/czue/django-wedding-website',
  supportSite: 'https://github.com/czue/django-wedding-website/issues',
  marketingSite: 'https://github.com/czue/django-wedding-website',
  donationUrl: null,
  docsUrl: 'https://github.com/czue/django-wedding-website#readme',
  description: {
    short: 'A Django-powered wedding website and guest management system',
    long: 'Django Wedding Website is a complete wedding website solution with integrated guest management. Features include a responsive single-page website, RSVP tracking, guest list management with Excel/CSV import/export, save-the-date email templates, personalized invitation pages, and a comprehensive admin dashboard.',
  },
  volumes: ['main'],
  images: {
    'django-wedding-website': {
      source: {
        dockerBuild: {
          workdir: './',
          dockerfile: 'Dockerfile',
        },
      },
    },
  },
  alerts: {
    install:
      'After installation, use the "Get Admin Credentials" action to retrieve your admin username and password.',
    update: null,
    uninstall: 'All wedding data and guest information will be deleted.',
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
