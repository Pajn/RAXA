import {Action, Call, Device, Plugin, defaultInterfaces} from 'raxa-common'
import plugin from './plugin'

export interface Trigger extends Device {
  config: {
    action: Action
  }
}

export default class TriggerPlugin extends Plugin {
  activeTriggers = new Set<string>()
  activeLearners = new Map<Trigger, NodeJS.Timer>()

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
          for (const [trigger, timer] of this.activeLearners.entries()) {
            clearTimeout(timer)
            this.log.debug(`Learned ${trigger.name} to`, {pluginId, triggerId})
            this.upsertDevice({
              ...trigger,
              config: {...trigger.config, pluginId, triggerId},
            })
          }
          this.activeLearners.clear()
        }
      },
    )
  }

  onDeviceCalled(call: Call, device: Trigger) {
    if (
      call.interfaceId === defaultInterfaces.SelfLearning.id &&
      call.method === defaultInterfaces.SelfLearning.methods.learn.id
    ) {
      let oldTimer = this.activeLearners.get(device)
      this.log.debug(`Learning ${device.name}`)
      if (oldTimer !== undefined) {
        this.log.debug(`Clearing old timer for ${device.name}`)
        clearTimeout(oldTimer)
      }
      this.activeLearners.set(
        device,
        setTimeout(() => {
          this.log.debug(`Timed out learning ${device.name}`)
          this.activeLearners.delete(device)
        }, 10000),
      )
    }
  }
}
