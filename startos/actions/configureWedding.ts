import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { getHttpInterfaceUrls } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  coupleName: Value.text({
    name: i18n('Couple Name'),
    description: i18n('Names of the couple (e.g. Aiden & Dandelion)'),
    required: false,
    default: null,
  }),
  weddingDate: Value.text({
    name: i18n('Wedding Date'),
    description: i18n('Date of the wedding (e.g. June 15, 2027)'),
    required: false,
    default: null,
  }),
  weddingLocation: Value.text({
    name: i18n('Wedding Location'),
    description: i18n('Location of the wedding (e.g. Denver, CO)'),
    required: false,
    default: null,
  }),
  websiteUrl: Value.dynamicSelect(async ({ effects }) => {
    const urls = await getHttpInterfaceUrls(effects)

    return {
      name: i18n('Website URL'),
      description: i18n('Public URL for the wedding website'),
      values: urls.reduce(
        (obj, url) => ({
          ...obj,
          [url]: url,
        }),
        {} as Record<string, string>,
      ),
      default: '',
    }
  }),
  contactEmail: Value.text({
    name: i18n('Contact Email'),
    description: i18n('Email address for guests to contact the couple'),
    required: false,
    default: null,
    inputmode: 'email',
  }),
})

export const configureWedding = sdk.Action.withInput(
  // id
  'configure-wedding',

  // metadata
  async ({ effects }) => ({
    name: i18n('Configure Wedding Details'),
    description: i18n(
      'Set the couple name, wedding date, location, website URL, and contact email displayed on the website',
    ),
    warning: i18n(
      'Changing these settings will restart the service to apply the new configuration.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const store = await storeJson.read((s) => s).once()
    return {
      coupleName: store?.coupleName || '',
      weddingDate: store?.weddingDate || '',
      weddingLocation: store?.weddingLocation || '',
      websiteUrl: store?.websiteUrl || undefined,
      contactEmail: store?.contactEmail || '',
    }
  },

  // the execution function
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      coupleName: input.coupleName || undefined,
      weddingDate: input.weddingDate || undefined,
      weddingLocation: input.weddingLocation || undefined,
      websiteUrl: input.websiteUrl || undefined,
      contactEmail: input.contactEmail || undefined,
    })
  },
)
