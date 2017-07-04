import {PluginDefinition} from 'raxa-common'

const plugin: PluginDefinition = {
  id: 'RaxaTellstickNet',
  name: 'RaxaTellstickNet',
  description:
    'Plugin for TellstickNet with modified firmware for direct communication',
  deviceClasses: {
    RaxaTellstickNet: {
      id: 'RaxaTellstickNet',
      name: 'RaxaTellstickNet',
      pluginId: 'RaxaTellstickNet',
      interfaceIds: ['433MHzPulse'],
    },
  },
  interfaces: {
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
  },
}

export default plugin
