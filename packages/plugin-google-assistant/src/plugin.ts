import {PluginDefinition} from 'raxa-common'

const plugin = {
  id: 'google-assistant',
  name: 'Google Assistant',
  shortDescription: 'Enables control from Google Assistant',
  description: '',
  deviceClasses: {},
  interfaces: {},
  httpForwarding: {
    port: 13000,
  },
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
