import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const getAdminCredentials = sdk.Action.withoutInput(
  // id
  'get-admin-credentials',

  // metadata
  async ({ effects }) => ({
    name: i18n('Get Admin Credentials'),
    description: i18n(
      'Retrieve the admin username and password for the Django admin panel',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // the execution function
  async ({ effects }) => {
    const store = await storeJson.read((s) => s).once()

    const rsvpUrl =
      store?.websiteUrl && store?.rsvpToken
        ? `${store.websiteUrl.replace(/\/+$/, '')}/rsvp/${store.rsvpToken}/`
        : null

    return {
      version: '1' as const,
      title: 'Admin Credentials',
      message:
        'Your admin credentials and RSVP link are below. Use the credentials to log into the Django admin panel at /admin/. Print the RSVP link on your invitations.',
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: 'Username',
            description: null,
            value: 'admin',
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: 'Password',
            description: null,
            value: store?.adminPassword ?? 'UNKNOWN',
            masked: true,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: 'RSVP Link Word',
            description:
              'The secret word in your RSVP link. Guests type it to reach the RSVP page.',
            value: store?.rsvpToken ?? 'UNKNOWN',
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: 'RSVP Link (print on invitations)',
            description:
              'The full RSVP URL guests visit to look up their party and respond.',
            value:
              rsvpUrl ??
              'Set your Website URL via "Configure Wedding" to generate this link.',
            masked: false,
            copyable: true,
            qr: !!rsvpUrl,
          },
        ],
      },
    }
  },
)
