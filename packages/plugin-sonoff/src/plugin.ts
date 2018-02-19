import {DeviceType, PluginDefinition, defaultInterfaces} from 'raxa-common'

const plugin = {
  id: 'sonoff',
  name: 'Sonoff',
  shortDescription: '',
  description: '',
  deviceClasses: {
    Sonoff: {
      id: 'Sonoff',
      name: 'Sonoff',
      pluginId: 'sonoff',
      interfaceIds: [defaultInterfaces.Power.id],
      types: [DeviceType.Light],
      allowManualCreation: true,
      config: {
        clientId: {
          id: 'clientId',
          name: 'Id',
          type: 'string' as 'string',
          modifiable: true,
        },
        channel: {
          id: 'channel',
          name: 'Channel',
          type: 'number' as 'number',
          modifiable: true,
        },
      },
    },
  },
  interfaces: {},
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
