import {
  Device,
  Modification,
  Plugin,
  actions,
  defaultInterfaces,
} from 'raxa-common'
import mqttPlugin from 'raxa-plugin-mqtt/cjs/plugin'
import {Omit} from 'recompose'
import plugin from './plugin'

type SonoffDevice = Omit<Device, 'config'> & {
  config: {
    clientId: string
    channel: number
  }
}

const sonoffTopicPattern = /^stat\/sonoff\/POWER([0-9])$/

export default class SonoffPlugin extends Plugin {
  async start() {
    this.listenOn(
      mqttPlugin.interfaces.MQTT.id,
      mqttPlugin.interfaces.MQTT.events.received.id,
      ({
        clientId,
        topic,
        value,
      }: {
        clientId: string
        topic: string
        value: string
      }) => {
        if (
          sonoffTopicPattern.test(topic) &&
          (value === 'OFF' || value === 'ON')
        ) {
          const device = this.state.scalar('devices', {
            where: {
              pluginId: plugin.id,
              deviceClassId: plugin.deviceClasses.Sonoff.id,
              config: {
                [plugin.deviceClasses.Sonoff.config.clientId.id]: clientId,
                [plugin.deviceClasses.Sonoff.config.channel
                  .id]: +sonoffTopicPattern.exec(topic)![1],
              },
            },
          })

          if (device) {
            this.dispatch(actions.statusUpdated, {
              deviceId: device.id,
              interfaceId: defaultInterfaces.Power.id,
              statusId: defaultInterfaces.Power.status.on.id,
              value: value === 'ON',
            })
          }
        }
      },
    )
  }

  onDeviceStatusModified(modification: Modification, device: Device) {
    if (
      device.pluginId === plugin.id &&
      device.deviceClassId === plugin.deviceClasses.Sonoff.id
    ) {
      const sonoffDevice = device as SonoffDevice

      if (
        modification.interfaceId === defaultInterfaces.Power.id &&
        modification.statusId === defaultInterfaces.Power.status.on.id
      ) {
        this.fireEvent(
          mqttPlugin.interfaces.MQTT.id,
          mqttPlugin.interfaces.MQTT.events.publish.id,
          {
            topic: `cmnd/${sonoffDevice.config.clientId}/POWER${
              sonoffDevice.config.channel
            }`,
            value: modification.value ? 'ON' : 'OFF',
          },
        )
        return this.dispatch(actions.statusUpdated, modification)
      }
    }
  }
}
