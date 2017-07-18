import {Job, scheduleJob} from 'node-schedule'
import {Action, Device, Plugin} from 'raxa-common'

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
        pluginId: 'Timer',
        deviceClassId: 'Timer',
      },
    })

    timers.forEach(timer => {
      this.jobs[timer.id] = scheduleJob(timer.config.cron, () =>
        this.fireTimer(timer),
      )
    })
  }

  stop() {
    Object.entries(this.jobs).forEach(([id, job]) => {
      job.cancel()
      delete this.jobs[id]
    })
  }

  onDeviceCreated(timer: Timer) {
    this.jobs[timer.id] = scheduleJob(timer.config.cron, () =>
      this.fireTimer(timer),
    )
  }

  onDeviceUpdated(timer: Timer) {
    if (this.jobs[timer.id]) {
      this.jobs[timer.id].cancel()
    }
    this.jobs[timer.id] = scheduleJob(timer.config.cron, () =>
      this.fireTimer(timer),
    )
  }

  private fireTimer(timer: Timer) {
    if (timer.config.action.type === 'call') {
      return this.callDevice(timer.config.action)
    } else {
      return this.setDeviceStatus(timer.config.action)
    }
  }
}
