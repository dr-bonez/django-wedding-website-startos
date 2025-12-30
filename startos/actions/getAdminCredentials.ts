import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const getAdminCredentials = sdk.Action.withoutInput(
  // id
  'get-admin-credentials',

  // metadata
  async ({ effects }) => ({
    name: 'Get Admin Credentials',
    description: 'Retrieve the admin username and password for the Django admin panel',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // the execution function
  async ({ effects }) => {
    const store = await storeJson.read((s) => s).once()

    return {
      version: '1' as const,
      title: 'Admin Credentials',
      message:
        'Your admin username and password are below. Use these to log into the Django admin panel at /admin/',
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
        ],
      },
    }
  },
)
