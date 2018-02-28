import {DeviceType, PluginDefinition, defaultInterfaces} from 'raxa-common'

const plugin = {
  id: 'nexa',
  name: 'Nexa',
  shortDescription: 'Support for Nexa devices',
  description: 'Plugin for Nexa devices',
  deviceClasses: {
    NexaCodeSwitch: {
      id: 'NexaCodeSwitch',
      name: 'NexaCodeSwitch',
      types: [DeviceType.Light],
      allowManualCreation: true,
      config: {
        sender: {
          id: 'sender',
          type: 'device' as 'device',
          modifiable: true,
          interfaceIds: [defaultInterfaces['433MHzPulse'].id],
        },
        houseCode: {
          id: 'houseCode',
          type: 'enum' as 'enum',
          modifiable: true,
          values: [
            {name: 'A', value: 'A'},
            {name: 'B', value: 'B'},
            {name: 'C', value: 'C'},
            {name: 'D', value: 'D'},
            {name: 'E', value: 'E'},
            {name: 'F', value: 'F'},
            {name: 'G', value: 'G'},
            {name: 'H', value: 'H'},
            {name: 'I', value: 'I'},
            {name: 'J', value: 'J'},
            {name: 'K', value: 'K'},
            {name: 'L', value: 'L'},
            {name: 'M', value: 'M'},
            {name: 'N', value: 'N'},
            {name: 'O', value: 'O'},
            {name: 'P', value: 'P'},
          ],
        },
        deviceCode: {
          id: 'deviceCode',
          type: 'enum' as 'enum',
          modifiable: true,
          values: [
            {name: '1', value: '1'},
            {name: '2', value: '2'},
            {name: '3', value: '3'},
            {name: '4', value: '4'},
            {name: '5', value: '5'},
            {name: '6', value: '6'},
            {name: '7', value: '7'},
            {name: '8', value: '8'},
            {name: '9', value: '9'},
            {name: '10', value: '10'},
            {name: '11', value: '11'},
            {name: '12', value: '12'},
            {name: '13', value: '13'},
            {name: '14', value: '14'},
            {name: '15', value: '15'},
            {name: '16', value: '16'},
          ],
        },
      },
      interfaceIds: [
        defaultInterfaces.Power.id,
        defaultInterfaces.SelfLearning.id,
      ],
      pluginId: 'Nexa',
    },
    NexaSelfLearning: {
      id: 'NexaSelfLearning',
      name: 'NexaSelfLearning',
      types: [DeviceType.Outlet],
      allowManualCreation: true,
      config: {
        sender: {
          id: 'sender',
          type: 'device' as 'device',
          interfaceIds: [defaultInterfaces['433MHzPulse'].id],
          modifiable: true,
        },
        deviceCode: {
          id: 'deviceCode',
          type: 'integer' as 'integer',
          modifiable: false,
          optional: true,
          showInSettings: false,
        },
        groupCode: {
          id: 'groupCode',
          type: 'integer' as 'integer',
          modifiable: false,
          optional: true,
          showInSettings: false,
        },
      },
      interfaceIds: [
        defaultInterfaces.Power.id,
        defaultInterfaces.SelfLearning.id,
        'NexaUnlearnAll',
      ],
      pluginId: 'Nexa',
    },
    NexaSelfLearningDimable: {
      id: 'NexaSelfLearningDimable',
      name: 'NexaSelfLearningDimable',
      types: [DeviceType.Light],
      allowManualCreation: true,
      config: {
        sender: {
          id: 'sender',
          type: 'device' as 'device',
          interfaceIds: [defaultInterfaces['433MHzPulse'].id],
          modifiable: true,
        },
        onLevel: {
          id: 'onLevel',
          type: 'integer' as 'integer',
          min: 0,
          max: 15,
          description: 'The dim level to set while turning on the lamp',
          modifiable: true,
        },
        deviceCode: {
          id: 'deviceCode',
          type: 'integer' as 'integer',
          modifiable: false,
          optional: true,
          showInSettings: false,
        },
        groupCode: {
          id: 'groupCode',
          type: 'integer' as 'integer',
          modifiable: false,
          optional: true,
          showInSettings: false,
        },
      },
      interfaceIds: [
        defaultInterfaces.Power.id,
        defaultInterfaces.SelfLearning.id,
        defaultInterfaces.Dimmer.id,
        'NexaUnlearnAll',
      ],
      pluginId: 'Nexa',
    },
  },
  interfaces: {
    NexaUnlearnAll: {
      id: 'NexaUnlearnAll',
      name: 'Unlearn all',
      methods: {
        unlearnAll: {
          id: 'unlearnAll',
          name: 'Unlearn All',
          showInSettings: true,
          arguments: {},
        },
      },
    },
  },
}
export const _typeCheck: PluginDefinition = plugin

export default plugin
