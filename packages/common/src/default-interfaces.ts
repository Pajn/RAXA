import {Interface} from '../lib/entities'

export const defaultInterfaces: {[id: string]: Interface} = {
  Light: {
    id: 'Light',
    status: {
      on: {
        id: 'on',
        type: 'boolean',
        modifiable: true,
        defaultValue: false,
      },
    },
  },
  Dimmer: {
    id: 'Dimmer',
    status: {
      level: {
        id: 'level',
        type: 'integer',
        modifiable: true,
        max: 100,
        min: 0,
        defaultValue: 0,
        unit: '%',
      },
    },
  },
  RGB: {
    id: 'RGB',
    status: {
      color: {
        id: 'color',
        type: 'object',
        modifiable: true,
        defaultValue: {
          red: 0,
          green: 0,
          blue: 0,
        },
        properties: {
          red: {
            id: 'red',
            type: 'integer',
            min: 0,
            max: 255,
          },
          green: {
            id: 'green',
            type: 'integer',
            min: 0,
            max: 255,
          },
          blue: {
            id: 'blue',
            type: 'integer',
            min: 0,
            max: 255,
          },
        },
      },
    },
  },
  Temperature: {
    id: 'Temperature',
    status: {
      temp: {
        id: 'temp',
        type: 'number',
        unit: '°C',
      },
    },
  },
}
