import {DeviceType, PluginDefinition, defaultInterfaces} from 'raxa-common'

const plugin = {
  id: 'sunricher',
  name: 'Sunricher',
  shortDescription: 'Support for Sunricher wifi controllers',
  description: 'Support for Sunricher wifi controllers',
  deviceClasses: {
    Sunricher: {
      id: 'Sunricher',
      name: 'Sunricher',
      types: [DeviceType.Light],
      allowManualCreation: true,
      config: {
        host: {
          id: 'host',
          name: 'Host',
          type: 'string' as 'string',
          modifiable: true,
        },
      },
      interfaceIds: [
        defaultInterfaces.Power.id,
        defaultInterfaces.Dimmer.id,
        defaultInterfaces.Color.id,
      ],
      pluginId: 'sunricher',
    },
  },
  interfaces: {},
}
export const _typeCheck: PluginDefinition = plugin

export default plugin
