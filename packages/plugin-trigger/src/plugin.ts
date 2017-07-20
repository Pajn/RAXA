import {DeviceType, PluginDefinition, defaultInterfaces} from 'raxa-common'

const plugin = {
  id: 'trigger',
  name: 'Trigger',
  description: 'Plugin for doing actions on simple triggers',
  deviceClasses: {
    Trigger: {
      id: 'Trigger',
      name: 'Trigger',
      types: [DeviceType.Automation],
      allowManualCreation: true,
      config: {
        // trigger: {
        //   id: 'triger',
        //   name: 'Trigger',
        //   type: 'object' as 'object',
        //   properties: {
        //   }
        // },
        pluginId: {
          id: 'pluginId',
          type: 'string' as 'string',
          modifiable: true,
        },
        triggerId: {
          id: 'triggerId',
          type: 'string' as 'string',
          modifiable: true,
        },
        action: {id: 'action', type: 'action' as 'action', modifiable: true},
      },
      interfaceIds: [
        defaultInterfaces.Power.id,
        defaultInterfaces.Color.id,
        defaultInterfaces['433MHzPulse'].id,
        defaultInterfaces.Temperature.id,
      ],
      pluginId: 'trigger',
    },
  },
  interfaces: {},
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
