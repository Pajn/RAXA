import {DeviceType, PluginDefinition, defaultInterfaces} from 'raxa-common'

const plugin: PluginDefinition = {
  id: 'LedStrip',
  name: 'LedStrip',
  description: 'Plugin for Digital LedStrip',
  deviceClasses: {
    LedStrip: {
      id: 'LedStrip',
      name: 'LedStrip',
      types: [DeviceType.Light, DeviceType.Thermometer, DeviceType.Connector],
      allowManualCreation: true,
      config: {
        host: {
          id: 'host',
          name: 'Host',
          type: 'string',
          modifiable: true,
        },
      },
      interfaceIds: [
        defaultInterfaces.Power.id,
        defaultInterfaces.Color.id,
        defaultInterfaces['433MHzPulse'].id,
        defaultInterfaces.Temperature.id,
      ],
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
  },
}

export default plugin
