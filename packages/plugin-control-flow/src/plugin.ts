import {DeviceType, PluginDefinition} from 'raxa-common'

const plugin = {
  id: 'control-flow',
  name: 'Control Flow',
  shortDescription: '',
  description: '',
  httpForwarding: {
    port: 13001,
  },
  deviceClasses: {
    ControlFlowProgram: {
      id: 'ControlFlowProgram',
      name: 'Control Flow Program',
      pluginId: 'control-flow',
      types: [DeviceType.Automation],
      allowManualCreation: true,
      config: {},
      interfaceIds: [],
    },
  },
  interfaces: {},
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
