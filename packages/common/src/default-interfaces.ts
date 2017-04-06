import {Interface} from '../lib/entities'

export const defaultInterfaces = {
  Light: {
    id: 'Light',
    status: {
      on: {
        id: 'on',
        type: 'boolean' as 'boolean',
        modifiable: true,
        defaultValue: false,
        interfaceId: 'Light',
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
  RGB: {
    id: 'RGB',
    status: {
      color: {
        id: 'color',
        type: 'object' as 'object',
        modifiable: true,
        defaultValue: {
          red: 0,
          green: 0,
          blue: 0,
        },
        properties: {
          red: {
            id: 'red',
            type: 'integer' as 'integer',
            min: 0,
            max: 255,
          },
          green: {
            id: 'green',
            type: 'integer' as 'integer',
            min: 0,
            max: 255,
          },
          blue: {
            id: 'blue',
            type: 'integer' as 'integer',
            min: 0,
            max: 255,
          },
        },
        interfaceId: 'RGB',
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
}

export const typedInterfaces: {[id: string]: Interface} = defaultInterfaces
