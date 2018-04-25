import {DeviceType, PluginDefinition} from 'raxa-common'

const config = {
  host: {id: 'host', type: 'string' as 'string'},
  port: {id: 'port', type: 'number' as 'number'},
  name: {id: 'name', type: 'string' as 'string'},
  id: {id: 'id', type: 'string' as 'string'},
}

const mediaItem = {
  title: {
    id: 'title',
    type: 'string' as 'string',
  },
  artwork: {
    id: 'artwork',
    type: 'string' as 'string',
  },
  duration: {
    id: 'duration',
    type: 'number' as 'number',
  },
}

const plugin = {
  id: 'chromecast',
  name: 'Chromecast',
  shortDescription: 'Support for Chromecasts',
  description: 'Support for Chromecasts',
  deviceClasses: {
    Chromecast: {
      id: 'Chromecast',
      name: 'Chromecast',
      pluginId: 'chromecast',
      types: [DeviceType.Media],
      allowManualCreation: false,
      config,
      interfaceIds: ['Chromecast', 'CurrentlyPlaying', 'Volume'],
    },
    ChromecastAudio: {
      id: 'ChromecastAudio',
      name: 'Chromecast Audio',
      pluginId: 'chromecast',
      types: [DeviceType.Media],
      allowManualCreation: false,
      config,
      interfaceIds: ['Chromecast', 'CurrentlyPlaying', 'Volume'],
    },
  },
  interfaces: {
    Chromecast: {
      id: 'Chromecast',
      status: {
        application: {
          id: 'application',
          type: 'string' as 'string',
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
        },
        muted: {
          id: 'muted',
          type: 'boolean' as 'boolean',
          modifiable: true,
        },
      },
      methods: {},
      events: {},
    },
  },
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
