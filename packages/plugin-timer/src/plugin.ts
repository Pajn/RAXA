import {DeviceType, PluginDefinition} from 'raxa-common'

const plugin = {
  id: 'timer',
  name: 'Timer',
  shortDescription: 'Set timers using weekdays or cron expressions',
  description: 'Plugin for Digital Timer',
  deviceClasses: {
    Timer: {
      id: 'Timer',
      name: 'Timer',
      types: [DeviceType.Automation],
      allowManualCreation: true,
      config: {
        cron: {
          id: 'cron',
          name: 'Cron Expression',
          type: 'string' as 'string',
          modifiable: true,
        },
        action: {
          id: 'action',
          name: 'Action',
          type: 'action' as 'action',
          modifiable: true,
        },
      },
      interfaceIds: [],
      pluginId: 'timer',
    },
  },
  interfaces: {},
}
export const _typeCheck: PluginDefinition = plugin

export default plugin
