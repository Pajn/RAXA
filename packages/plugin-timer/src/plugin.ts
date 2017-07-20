import {DeviceType, PluginDefinition} from 'raxa-common'

const plugin = {
  id: 'Timer',
  name: 'Timer',
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
      pluginId: 'Timer',
    },
  },
  interfaces: {},
}
export const _typeCheck: PluginDefinition = plugin

export default plugin
