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
        type: 'integer' as 'integer',
        modifiable: true,
        defaultValue: 0,
        min: 0,
        max: 0xffffff,
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
