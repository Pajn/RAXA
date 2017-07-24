import {DeviceType, PluginDefinition, defaultInterfaces} from 'raxa-common'

const plugin = {
  id: 'trigger',
  name: 'Trigger',
  shortDescription: 'Do actions on simple triggers like button presses',
  description: 'Do actions on simple triggers like button presses',
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
          modifiable: false,
          optional: true,
        },
        triggerId: {
          id: 'triggerId',
          type: 'string' as 'string',
          modifiable: false,
          optional: true,
        },
        action: {id: 'action', type: 'action' as 'action', modifiable: true},
      },
      interfaceIds: [
        defaultInterfaces.Trigger.id,
        defaultInterfaces.SelfLearning.id,
      ],
      pluginId: 'trigger',
    },
  },
  interfaces: {},
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
