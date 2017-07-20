import {Interface} from './entities'

export const defaultInterfaces = {
  Trigger: {
    id: 'Trigger',
    events: {
      triggered: {
        id: 'triggered',
        type: 'object' as 'object',
        properties: {
          pluginId: {type: 'string' as 'string'},
          triggerId: {type: 'string' as 'string'},
        },
      },
    },
  },
  Power: {
    id: 'Power',
    status: {
      on: {
        id: 'on',
        type: 'boolean' as 'boolean',
        modifiable: true,
        defaultValue: false,
        interfaceId: 'Power',
      },
    },
  },
  Dimmer: {
    id: 'Dimmer',
    status: {
      level: {
        id: 'level',
        type: 'integer' as 'integer',
        modifiable: true,
        max: 100,
        min: 0,
        defaultValue: 0,
        unit: '%',
        interfaceId: 'Dimmer',
      },
    },
  },
  Color: {
    id: 'Color',
    status: {
      color: {
        id: 'color',
        type: 'integer' as 'integer',
        modifiable: true,
        defaultValue: 0,
        min: 0,
        max: 0xffffff,
        interfaceId: 'Color',
      },
    },
  },
  Temperature: {
    id: 'Temperature',
    status: {
      temp: {
        id: 'temp',
        type: 'number' as 'number',
        unit: '°C',
        interfaceId: 'Temperature',
      },
    },
  },
  '433MHzPulse': {
    id: '433MHzPulse',
    name: '433MHzPulse',
    methods: {
      send: {
        id: 'send',
        arguments: {
          pulse: {
            id: 'pulse',
            type: 'array' as 'array',
            items: {
              id: 'items',
              type: 'integer' as 'integer',
              minimum: 0,
              maximum: 255,
            },
          },
          repeats: {
            id: 'repeats',
            type: 'integer' as 'integer',
            minimum: 1,
          },
          pause: {
            id: 'pause',
            type: 'integer' as 'integer',
            minimum: 0,
          },
        },
      },
    },
  },
  SelfLearning: {
    id: 'SelfLearning',
    name: 'Self Learning',
    methods: {
      learn: {
        id: 'learn',
        showInSettings: true,
        arguments: {},
      },
    },
  },
}

export const typedInterfaces: {[id: string]: Interface} = defaultInterfaces
