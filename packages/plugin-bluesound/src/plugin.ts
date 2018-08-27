import {DeviceType, PluginDefinition} from 'raxa-common'

const config = {
  host: {id: 'host', type: 'string' as 'string'},
  model: {id: 'model', type: 'string' as 'string'},
  name: {id: 'name', type: 'string' as 'string'},
  id: {id: 'id', type: 'string' as 'string'},
}

const mediaSource = {
  id: {
    id: 'id',
    type: 'string' as 'string',
  },
  name: {
    id: 'name',
    type: 'string' as 'string',
  },
  artwork: {
    id: 'artwork',
    type: 'string' as 'string',
  },
}

const plugin = {
  id: 'bluesound',
  name: 'Bluesound',
  shortDescription: 'Control and monitor Bluesound players',
  description: 'Control and monitor Bluesound players',
  deviceClasses: {
    BluesoundPlayer: {
      id: 'BluesoundPlayer',
      name: 'Bluesound Player',
      pluginId: 'bluesound',
      types: [DeviceType.Media],
      allowManualCreation: false,
      config,
      interfaceIds: ['CurrentlyPlaying', 'Volume'],
    },
  },
  interfaces: {
    MediaSources: {
      id: 'MediaSources',
      status: {
        avalibleSources: {
          id: 'avalibleSources',
          type: 'array' as 'array',
          items: {
            id: 'avalibleSource',
            type: 'object' as 'object',
            properties: mediaSource,
          },
        },
      },
      methods: {
        setSource: {
          id: 'setSource',
          showInSettings: false,
          arguments: {
            source: {
              id: 'source',
              type: 'object' as 'object',
              properties: mediaSource,
            },
          },
        },
      },
      events: {},
    },
  },
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
