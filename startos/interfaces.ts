import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort, uiHostId, uiInterfaceId } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, uiHostId)
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
  })

  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: uiInterfaceId,
    description: i18n('The wedding website and admin interface'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const admin = sdk.createInterface(effects, {
    name: i18n('Admin Panel'),
    id: 'admin',
    description: i18n('Django admin panel for managing guests and settings'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '/admin/',
    query: {},
  })

  const uiReceipt = await uiMultiOrigin.export([ui, admin])

  return [uiReceipt]
})
