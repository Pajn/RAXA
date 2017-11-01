import {PluginDefinition} from 'raxa-common'

const plugin = {
  id: 'sony-receiver',
  name: 'Sony Receiver',
  shortDescription: '',
  description: '',
  deviceClasses: {
    SonyReceiver: {
      id: 'SonyReceiver',
      name: 'Sony Receiver',
      pluginId: 'sony-receiver',
      types: [],
      allowManualCreation: true,
      config: {
        host: {
          id: 'host',
          type: 'string' as 'string',
          modifiable: true,
        },
      },
      interfaceIds: ['Power', 'SonyReceiver'],
    },
  },
  interfaces: {
    SonyReceiver: {
      id: 'SonyReceiver',
      methods: {
        volUp: {
          id: 'volUp',
          showInSettings: true,
          arguments: {},
        },
        volDown: {
          id: 'volDown',
          showInSettings: true,
          arguments: {},
        },
        tv: {
          id: 'tv',
          showInSettings: true,
          arguments: {},
        },
        speakers: {
          id: 'speakers',
          showInSettings: true,
          arguments: {},
        },
      },
    },
  },
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
