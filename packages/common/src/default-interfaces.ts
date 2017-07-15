import {Interface} from '../lib/entities'

export const defaultInterfaces = {
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
        arguments: {
          pulse: {
            type: 'array',
            items: {
              type: 'integer',
              minimum: 0,
              maximum: 255,
            },
          },
          repeats: {
            type: 'integer',
            minimum: 1,
          },
          pause: {
            type: 'integer',
            minimum: 0,
          },
        },
      },
    },
  },
}

export const typedInterfaces: {[id: string]: Interface} = defaultInterfaces
