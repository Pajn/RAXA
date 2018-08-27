import {DeviceType, PluginDefinition} from 'raxa-common'

const config = {
  host: {id: 'host', type: 'string' as 'string'},
  port: {id: 'port', type: 'number' as 'number'},
  name: {id: 'name', type: 'string' as 'string'},
  id: {id: 'id', type: 'string' as 'string'},
}

const plugin = {
  id: 'chromecast',
  name: 'Chromecast',
  shortDescription: 'Control and monitor Chromecasts',
  description: 'Control and monitor Chromecasts',
  deviceClasses: {
    Chromecast: {
      id: 'Chromecast',
      name: 'Chromecast',
      pluginId: 'chromecast',
      types: [DeviceType.Media],
      allowManualCreation: false,
      config,
      interfaceIds: ['Chromecast', 'CurrentlyPlaying', 'Volume', 'Mute'],
    },
    ChromecastAudio: {
      id: 'ChromecastAudio',
      name: 'Chromecast Audio',
      pluginId: 'chromecast',
      types: [DeviceType.Media],
      allowManualCreation: false,
      config,
      interfaceIds: ['Chromecast', 'CurrentlyPlaying', 'Volume', 'Mute'],
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
  },
}

export const _typeCheck: PluginDefinition = plugin

export default plugin
