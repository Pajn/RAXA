import {PluginDefinition} from 'raxa-common'

const plugin = {
  id: 'mqtt',
  name: 'MQTT Broker',
  shortDescription: '',
  description: '',
  deviceClasses: {},
  interfaces: {
    MQTT: {
      id: 'MQTT',
      events: {
        received: {
          id: 'received',
          type: 'object' as 'object',
          properties: {
            clientId: {id: 'clientId', type: 'string' as 'string'},
            topic: {id: 'topic', type: 'string' as 'string'},
            value: {id: 'value', type: 'string' as 'string'},
          },
        },
        publish: {
          id: 'publish',
          type: 'object' as 'object',
          properties: {
            clientId: {id: 'clientId', type: 'string' as 'string'},
            topic: {id: 'topic', type: 'string' as 'string'},
            value: {id: 'value', type: 'string' as 'string'},
          },
        },
      },
    },
  },
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
