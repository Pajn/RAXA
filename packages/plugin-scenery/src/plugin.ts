import {DeviceType, PluginDefinition} from 'raxa-common'

const plugin = {
  id: 'scenery',
  name: 'Scenery',
  shortDescription:
    'Create scenerys which allows setting multiple lights at once',
  description: 'Create scenerys which allows setting multiple lights at once',
  deviceClasses: {
    Scenery: {
      id: 'Scenery',
      name: 'Scenery',
      pluginId: 'scenery',
      types: [DeviceType.Scenery],
      allowManualCreation: true,
      config: {
        modifications: {
          id: 'modifications',
          name: 'Devices',
          type: 'array' as 'array',
          modifiable: true,
          items: {
            id: 'items',
            type: 'modification' as 'modification',
          },
        },
      },
      interfaceIds: ['Scenery'],
    },
  },
  interfaces: {
    Scenery: {
      id: 'Scenery',
      methods: {
        set: {
          id: 'set',
          arguments: {},
        },
      },
    },
  },
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
