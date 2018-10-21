import {Interface} from './entities'

const mediaItem = {
  title: {
    id: 'title',
    type: 'string' as 'string',
    name: 'Title',
  },
  artwork: {
    id: 'artwork',
    type: 'string' as 'string',
    name: 'Artwork',
  },
  duration: {
    id: 'duration',
    type: 'number' as 'number',
    name: 'Duration',
  },
}

export const defaultInterfaces = {
  Trigger: {
    id: 'Trigger',
    events: {
      triggered: {
        id: 'triggered',
        type: 'object' as 'object',
        properties: {
          pluginId: {id: 'pluginId', type: 'string' as 'string'},
          triggerId: {id: 'triggerId', type: 'string' as 'string'},
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
        name: 'Power',
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
        name: 'Brightness',
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
        name: 'Color',
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
        name: 'Temperature',
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
  CurrentlyPlaying: {
    id: 'CurrentlyPlaying',
    status: {
      currentMedia: {
        id: 'currentMedia',
        type: 'object' as 'object',
        properties: mediaItem,
        name: 'Current Media',
      },
      playerState: {
        id: 'playerState',
        type: 'enum' as 'enum',
        values: [
          {name: 'idle', value: 'idle'},
          {name: 'playing', value: 'playing'},
          {name: 'paused', value: 'paused'},
          {name: 'buffering', value: 'buffering'},
        ],
        name: 'Player State',
      },
    },
    methods: {
      play: {
        id: 'play',
        showInSettings: true,
        arguments: {},
      },
      pause: {
        id: 'pause',
        showInSettings: true,
        arguments: {},
      },
      stop: {
        id: 'stop',
        showInSettings: true,
        arguments: {},
      },
    },
    events: {},
  },
  Volume: {
    id: 'Volume',
    status: {
      volume: {
        id: 'volume',
        type: 'number' as 'number',
        min: 0,
        max: 1,
        modifiable: true,
        name: 'Volume',
      },
    },
    methods: {},
    events: {},
  },
  Mute: {
    id: 'Mute',
    status: {
      muted: {
        id: 'muted',
        type: 'boolean' as 'boolean',
        modifiable: true,
        name: 'Muted',
      },
    },
    methods: {},
    events: {},
  },
}

export const typedInterfaces: {[id: string]: Interface} = defaultInterfaces
