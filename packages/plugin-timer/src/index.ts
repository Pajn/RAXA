import {Job, scheduleJob} from 'node-schedule'
import {Action, Device, Plugin} from 'raxa-common'
import plugin from './plugin'

export interface Timer extends Device {
  config: {
    cron: string
    action: Action
    [field: string]: any
  }
}

export default class TimerPlugin extends Plugin {
  jobs: {[deviceId: string]: Job} = {}

  start() {
    const timers: Array<Timer> = this.state.list('devices', {
      where: {
        pluginId: plugin.id,
        deviceClassId: plugin.deviceClasses.Timer.id,
      },
    })

    timers.forEach(timer => {
      this.scheduleTimer(timer)
    })
  }

  stop() {
    Object.entries(this.jobs).forEach(([id, job]) => {
      job.cancel()
      delete this.jobs[id]
    })
  }

  onDeviceCreated(timer: Timer) {
    this.scheduleTimer(timer)
  }

  onDeviceUpdated(timer: Timer) {
    this.scheduleTimer(timer)
  }

  private scheduleTimer(timer: Timer) {
    if (this.jobs[timer.id]) {
      this.jobs[timer.id].cancel()
    }
    this.jobs[timer.id] = scheduleJob(timer.config.cron, () => {
      const nextInvocation = this.jobs[timer.id].nextInvocation().toISOString()
      this.log.debug(
        `Timer ${timer.name} fired. Next invocation on ${nextInvocation}`,
      )
      this.fireTimer(timer)
    })
    const nextInvocation = this.jobs[timer.id].nextInvocation().toISOString()
    this.log.info(`Scheduled timer ${timer.name} to run on ${nextInvocation}`)
  }

  private fireTimer(timer: Timer) {
    if (timer.config.action.type === 'call') {
      return this.callDevice(timer.config.action)
    } else {
      return this.setDeviceStatus(timer.config.action)
    }
  }
}
