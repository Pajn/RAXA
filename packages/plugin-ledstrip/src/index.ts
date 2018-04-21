import fetch from 'node-fetch'
import {Queue, timeout} from 'promise-land'
import {Device, Modification, Plugin, defaultInterfaces} from 'raxa-common'
import {Call, actions} from 'raxa-common/cjs'
// import plugin from './plugin'

export interface LedStrip extends Device {
  config: {
    host: string
    [field: string]: any
  }
}

export default class LedStripPlugin extends Plugin {
  private executionQueue = new Queue()
  tempTimer: NodeJS.Timer

  start() {
    this.tempTimer = setInterval(() => this.getTemp(), 1000 * 60 * 5)
  }

  stop() {
    clearInterval(this.tempTimer)
  }

  onDeviceStatusModified(
    {interfaceId, statusId, value}: Modification,
    device: LedStrip,
  ) {
    this.log.debug('Setting led strip', device.name, {
      interfaceId,
      statusId,
      value,
    })

    if (
      interfaceId === defaultInterfaces.Power.id &&
      statusId === defaultInterfaces.Power.status.on.id
    ) {
      return this.setPower(value, device)
    } else if (
      interfaceId === defaultInterfaces.Color.id &&
      statusId === defaultInterfaces.Color.status.color.id
    ) {
      return this.setColor(+value, device)
      // } else if (interfaceId === plugin.interfaces && statusId === 'gradient') {
      //   return this.setGradient(value, device)
    }
  }

  async onDeviceCalled(call: Call, device: LedStrip) {
    if (call.interfaceId === '433MHzPulse' && call.method === 'send') {
      const pulse: Array<number> = call.arguments.pulse
      const repeats = call.arguments.repeats
      const delay = call.arguments.pause

      const pulseString = pulse
        .map(period => period.toString(16).padStart(2, '0'))
        .join('')
      this.log.debug('Sending 433MHzPulse', {
        from: device.name,
        pulseString,
        repeats,
        delay,
      })
      await this.call('radio', {pulse: pulseString, repeats, delay}, device)
      await this.executionQueue.add(() => timeout(delay))
    }
  }

  private getTemp() {
    this.state
      .list('devices', {where: {deviceClassId: 'LedStrip'}})
      .forEach((device: LedStrip) => {
        this.executionQueue.add(async () => {
          await fetch(`${device.config.host}/temp`)
            .then(res => res.text())
            .then(body => +body.split(' ')[0])
            .then(temp => {
              return this.dispatch(actions.statusUpdated, {
                deviceId: device.id,
                interfaceId: 'Temperature',
                statusId: 'temp',
                value: temp,
              })
            })
            .catch(error => {
              this.log.error('Failed to get temp', error)
            })
        })
      })
  }

  private async setPower(on: boolean, device: LedStrip) {
    if (on) {
      const color =
        ((this.state.getState().status[device.id] || {})[
          defaultInterfaces.Color.id
        ] || {})[defaultInterfaces.Color.status.color.id] || 0
      const brightness =
        ((color & 0xff0000) >> (16 + (color & 0x00ff00))) >>
        (8 + (color & 0x0000ff))

      await this.setColor(brightness < 50 ? 0x808080 : color, device)

      this.dispatch(actions.statusUpdated, {
        deviceId: device.id,
        interfaceId: defaultInterfaces.Power.id,
        statusId: defaultInterfaces.Power.status.on.id,
        value: true,
      })
    } else {
      await this.setColor(0, device)
    }
  }

  private async setColor(value: number, device: LedStrip) {
    await this.executionQueue.add(() => timeout(80))
    await this.call('on', {color: value.toString(16)}, device)

    if (value === 0) {
      this.dispatch(actions.statusUpdated, {
        deviceId: device.id,
        interfaceId: defaultInterfaces.Power.id,
        statusId: defaultInterfaces.Power.status.on.id,
        value: false,
      })
    } else {
      this.dispatch(actions.statusUpdated, {
        deviceId: device.id,
        interfaceId: defaultInterfaces.Power.id,
        statusId: defaultInterfaces.Power.status.on.id,
        value: true,
      })
      this.dispatch(actions.statusUpdated, {
        deviceId: device.id,
        interfaceId: defaultInterfaces.Color.id,
        statusId: defaultInterfaces.Color.status.color.id,
        value,
      })
    }

    await this.executionQueue.add(() => timeout(80))
  }

  // private setGradient(
  //   value: Array<{position: number; color: number}>,
  //   device: LedStrip,
  // ) {
  //   const gradient = value
  //     .map(stop => {
  //       const position = this.position(stop.position, device)
  //       const color = stop.color.toString(16)

  //       return `${position}:${color};`
  //     })
  //     .join('')

  //   return this.call('on', {gradient}, device)
  // }

  private call(path: string, params: any, device: LedStrip) {
    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&')
    if (query) {
      query = `?${query}`
    }

    const url = `${device.config.host}/${path}${query}`
    this.log.debug('Request:', {url})
    return this.executionQueue.add(async () =>
      fetch(url)
        .then(async res => {
          this.log.debug('Response:', {
            url,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          })
        })
        .catch(e => {
          this.log.error('Error:', e)
        }),
    )
  }

  // private position(percentage: number, _: LedStrip) {
  //   return Math.round(percentage * 60)
  // }
}
