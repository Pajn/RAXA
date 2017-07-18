import {DeviceType, PluginDefinition} from 'raxa-common'

const plugin: PluginDefinition = {
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
          type: 'string',
          modifiable: true,
        },
        action: {
          id: 'action',
          name: 'Action',
          type: 'action',
          modifiable: true,
        },
      },
      interfaceIds: [],
      pluginId: 'Timer',
    },
  },
  interfaces: {},
}

export default plugin
