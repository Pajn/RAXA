import {Action, Device, Plugin, defaultInterfaces} from 'raxa-common'
import plugin from './plugin'

export interface Trigger extends Device {
  config: {
    action: Action
  }
}

export default class TriggerPlugin extends Plugin {
  activeTriggers = new Set<string>()

  start() {
    this.listenOn(
      defaultInterfaces.Trigger.id,
      defaultInterfaces.Trigger.events.triggered.id,
      ({pluginId, triggerId}) => {
        const uniqueId = `${pluginId}:/${triggerId}`
        if (this.activeTriggers.has(uniqueId)) return
        this.activeTriggers.add(uniqueId)
        setTimeout(() => this.activeTriggers.delete(uniqueId), 500)

        const device: Trigger = this.state.scalar('devices', {
          where: {
            pluginId: plugin.id,
            deviceClassId: plugin.deviceClasses.Trigger.id,
            config: {pluginId, triggerId},
          } as Partial<Device>,
        })
        this.log.debug({pluginId, triggerId, device})
        if (device) {
          if (device.config.action.type === 'call') {
            this.callDevice(device.config.action)
          } else {
            this.setDeviceStatus(device.config.action)
          }
        } else {
        }
      },
    )
  }
}
