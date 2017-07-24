import {DeviceType, PluginDefinition} from 'raxa-common'

const plugin = {
  id: 'raxa-tellsticknet',
  name: 'RaxaTellstickNet',
  shortDescription:
    'Support for Tellstick Net with modified firmware for direct communication',
  description:
    'Support for Tellstick Net with modified firmware for direct communication',
  deviceClasses: {
    RaxaTellstickNet: {
      id: 'RaxaTellstickNet',
      name: 'RaxaTellstickNet',
      types: [DeviceType.Connector],
      pluginId: 'RaxaTellstickNet',
      interfaceIds: ['433MHzPulse', 'TellstickReceived'],
      config: {
        activationCode: {
          id: 'activationCode',
          name: 'Activation Code',
          type: 'string' as 'string',
        },
      },
    },
  },
  interfaces: {
    TellstickReceived: {
      id: 'TellstickReceived',
      events: {
        message: {
          id: 'message',
          type: 'string' as 'string',
        },
      },
    },
  },
}
export const _typeCheck: PluginDefinition = plugin

export default plugin
