import {Interface} from './entities'

export const interfaceId = {
  Light: 'Light',
  Dimmer: 'Dimmer',
  RGB: 'RGB',
  Temperature: 'Temperature',
}

export const defaultInterfaces: Interface[] = [
  {
    id: interfaceId.Light,
    name: interfaceId.Light,
    status: {on: {type: 'boolean', modifiable: true, defaultValue: false}},
  },
  {
    id: interfaceId.Dimmer,
    name: interfaceId.Dimmer,
    status: {
      level: {type: 'integer', modifiable: true, max: 'max', min: 0, defaultValue: 0},
    },
    variables: {'max': {'type': 'integer', defaultValue: 100}},
  },
  {
    id: interfaceId.RGB,
    name: interfaceId.RGB,
    status: {
      color: {
        type: 'object',
        modifiable: true,
        defaultValue: {
          red: 0,
          green: 0,
          blue: 0,
        },
        properties: {
          red: {
            type: 'integer',
            min: 0,
            max: 255,
          },
          green: {
            type: 'integer',
            min: 0,
            max: 255,
          },
          blue: {
            type: 'integer',
            min: 0,
            max: 255,
          },
        }
      }
    }
  },
  {
    id: interfaceId.Temperature,
    name: interfaceId.Temperature,
    status: {
      temp: {type: 'integer', unit: '°C'},
    },
  },
]
