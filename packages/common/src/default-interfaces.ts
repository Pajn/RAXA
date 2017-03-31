export const defaultInterfaces = {
  Light: {
    id: 'Light',
    status: {
      on: {
        id: 'on',
        interfaceId: 'Light',
        type: 'boolean' as 'boolean',
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
        interfaceId: 'Dimmer',
        type: 'integer' as 'integer',
        modifiable: true,
        max: 100,
        min: 0,
        defaultValue: 0,
      },
    },
  },
  RGB: {
    id: 'RGB',
    status: {
      color: {
        id: 'color',
        interfaceId: 'RGB',
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
      },
    },
  },
  Temperature: {
    id: 'Temperature',
    status: {
      temp: {
        id: 'temp',
        interfaceId: 'Temperature',
        type: 'number' as 'number',
        unit: '°C',
      },
    },
  },
}
