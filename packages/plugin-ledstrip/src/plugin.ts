import {PluginDefinition} from 'raxa-common'

const plugin: PluginDefinition = {
  id: 'LedStrip',
  name: 'LedStrip',
  description: 'Plugin for Digital LedStrip',
  deviceClasses: {
    LedStrip: {
      id: 'LedStrip',
      name: 'LedStrip',
      allowManualCreation: true,
      config: {
        host: {
          id: 'host',
          name: 'Host',
          type: 'string',
          modifiable: true,
        },
      },
      interfaceIds: ['RGB', '433MHzPulse', 'Temperature'],
      pluginId: 'LedStrip',
    },
  },
  interfaces: {
    //   ColorGradient: {
    //     id: 'ColorGradient',
    //     status: {
    //       gradient: {
    //         id: 'gradient',
    //         type: 'array',
    //         minLength: 2,
    //         items: {
    //           id: 'object',
    //           type: 'object',
    //           properties: {
    //             position: {
    //               id: 'position',
    //               type: 'number',
    //               min: 0,
    //               max: 100,
    //             },
    //             color: {
    //               id: 'color',
    //               type: 'integer',
    //               min: 0,
    //               max: 0xffffff,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
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
