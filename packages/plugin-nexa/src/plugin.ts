import {PluginDefinition} from '../../common/cjs/entities'

const plugin: PluginDefinition = {
  id: 'Nexa',
  name: 'Nexa',
  description: 'Plugin for Nexa devices',
  deviceClasses: {
    // NexaCodeSwitch: {
    //   id: 'NexaCodeSwitch',
    //   name: 'NexaCodeSwitch',
    //   allowManualCreation: true,
    //   config: {
    //     sender: {
    //       id: 'sender',
    //       type: 'device',
    //       interfaceIds: ['433MHzPulse'],
    //     },
    //     houseCode: {
    //       id: 'houseCode',
    //       type: 'enum',
    //       values: [
    //         'A',
    //         'B',
    //         'C',
    //         'D',
    //         'E',
    //         'F',
    //         'G',
    //         'H',
    //         'I',
    //         'J',
    //         'K',
    //         'L',
    //         'M',
    //         'N',
    //         'O',
    //         'P',
    //       ],
    //     },
    //     deviceCode: {
    //       type: 'enum',
    //       values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    //     },
    //   },
    //   interfaceIds: ['Lamp', 'SelfLearning'],
    //   pluginId: 'Nexa',
    //   // requiresInterfaces: ['433MHzPulse'],
    // },
    NexaSelfLearning: {
      id: 'NexaSelfLearning',
      name: 'NexaSelfLearning',
      allowManualCreation: true,
      config: {
        sender: {
          id: 'sender',
          type: 'device',
          interfaceIds: ['433MHzPulse'],
          modifiable: true,
        },
      },
      interfaceIds: ['Light', 'SelfLearning'],
      // requiresInterfaces: ['433MHzPulse'],
      pluginId: 'Nexa',
    },
    NexaSelfLearningDimable: {
      id: 'NexaSelfLearningDimable',
      name: 'NexaSelfLearningDimable',
      allowManualCreation: true,
      config: {
        sender: {
          id: 'sender',
          type: 'device',
          interfaceIds: ['433MHzPulse'],
          modifiable: true,
        },
        onLevel: {
          id: 'onLevel',
          type: 'integer',
          min: 0,
          max: 15,
          description: 'The dim level to set while turning on the lamp',
        },
      },
      interfaceIds: ['Light', 'SelfLearning', 'Dimmer'],
      // requiresInterfaces: ['433MHzPulse'],
      pluginId: 'Nexa',
    },
  },
  interfaces: {
    SelfLearning: {
      id: 'SelfLearning',
    },
  },
}

export default plugin
