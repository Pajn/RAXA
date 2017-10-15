import {DeviceType, PluginDefinition, defaultInterfaces} from 'raxa-common'

const plugin: PluginDefinition = {
  id: 'mysensors',
  name: 'MySensors',
  description: 'Plugin for MySensors serial gateway',
  shortDescription: 'Plugin for MySensors serial gateway',
  deviceClasses: {
    'Serial MySensors Gateway': {
      id: 'Serial MySensors Gateway',
      pluginId: 'mysensors',
      name: 'Serial MySensors Gateway',
      types: [],
      config: {
        serialPort: {
          id: 'serialPort',
          type: 'string' as 'string',
          modifiable: true,
        },
      },
      interfaceIds: ['MySensors Gateway'],
      allowManualCreation: true,
    },
    'MySensors Sensor': {
      id: 'MySensors Sensor',
      pluginId: 'mysensors',
      name: 'MySensors Sensor',
      types: [DeviceType.Light],
      config: {
        gateway: {
          id: 'gateway',
          type: 'device' as 'device',
          modifiable: true,
          interfaceIds: ['MySensors Gateway'],
        },
        node: {
          id: 'node',
          modifiable: true,
          type: 'integer' as 'integer',
        },
        sensor: {
          id: 'sensor',
          modifiable: true,
          type: 'integer' as 'integer',
        },
      },
      interfaceIds: [defaultInterfaces.Power.id, defaultInterfaces.Dimmer.id],
      allowManualCreation: true,
    },
  },
  interfaces: {
    'MySensors Gateway': {
      id: 'MySensors Gateway',
      pluginId: 'mysensors',
      methods: {
        send: {
          id: 'send',
          arguments: {
            node: {
              id: 'node',
              type: 'integer' as 'integer',
              min: 0,
              max: 255,
            },
            sensor: {
              id: 'sensor',
              type: 'integer' as 'integer',
              min: 0,
              max: 255,
            },
            type: {
              id: 'type',
              type: 'integer' as 'integer',
              min: 0,
              max: 4,
            },
            subType: {
              id: 'subType',
              type: 'integer' as 'integer',
              min: 0,
              max: 255,
            },
            // payload: {},
          },
        },
      },
    },
  },
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
