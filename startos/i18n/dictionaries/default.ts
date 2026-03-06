export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Django Wedding Website!': 0,
  Gunicorn: 1,
  'Gunicorn is ready': 2,
  'Gunicorn is not ready': 3,
  'Web Interface': 4,
  'The wedding website is ready': 5,
  'The wedding website is not ready': 6,

  // interfaces.ts
  'Web UI': 7,
  'The wedding website and admin interface': 8,
  'Admin Panel': 9,
  'Django admin panel for managing guests and settings': 10,

  // actions/getAdminCredentials.ts
  'Get Admin Credentials': 11,
  'Retrieve the admin username and password for the Django admin panel': 12,

  // actions/manageSmtp.ts
  'Configure SMTP': 13,
  'Add SMTP credentials for sending email invitations and RSVPs': 14,

  // init/initializeService.ts
  'Retrieve the admin password so you can manage your wedding website': 15,

  // actions/configureWedding.ts
  'Configure Wedding Details': 16,
  'Set the couple name, wedding date, location, website URL, and contact email displayed on the website': 17,
  'Changing these settings will restart the service to apply the new configuration.': 18,
  'Couple Name': 19,
  'Names of the couple (e.g. Aiden & Dandelion)': 20,
  'Wedding Date': 21,
  'Date of the wedding (e.g. June 15, 2027)': 22,
  'Wedding Location': 23,
  'Location of the wedding (e.g. Denver, CO)': 24,
  'Website URL': 25,
  'Public URL for the wedding website': 26,
  'Contact Email': 27,
  'Email address for guests to contact the couple': 28,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
