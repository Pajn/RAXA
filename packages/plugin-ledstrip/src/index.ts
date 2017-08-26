import fetch from 'node-fetch'
import {Device, Modification, Plugin} from 'raxa-common'
import {Call, actions} from 'raxa-common/cjs'

export interface LedStrip extends Device {
  config: {
    host: string
    [field: string]: any
  }
}

export default class LedStripPlugin extends Plugin {
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
    this.log.debug('Setting led strip', device.name)

    if (interfaceId === 'RGB' && statusId === 'color') {
      this.setColor(value, device)
    } else if (interfaceId === 'ColorGradient' && statusId === 'gradient') {
      this.setGradient(value, device)
    }
  }

  onDeviceCalled(call: Call, device: LedStrip) {
    if (call.interfaceId === '433MHzPulse' && call.method === 'send') {
      const pulse: Array<number> = [
        // Pulse the antenna to ensure good transmission
        255,
        255,
        //
        255,
        255,
        //
        255,
        255,
        //
        255,
        ...call.arguments.pulse,
      ]
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
      this.call('radio', {pulse: pulseString, repeats, delay}, device)
    }
  }

  private getTemp() {
    this.state
      .list('devices', {where: {deviceClassId: 'LedStrip'}})
      .forEach((device: LedStrip) => {
        fetch(`${device.config.host}/temp`)
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
      })
  }

  private setColor(value: number, device: LedStrip) {
    this.call('on', {color: value}, device)
  }

  private setGradient(
    value: Array<{position: number; color: number}>,
    device: LedStrip,
  ) {
    const gradient = value
      .map(stop => {
        const position = this.position(stop.position, device)
        const color = stop.color.toString(16)

        return `${position}:${color};`
      })
      .join('')

    this.call('on', {gradient}, device)
  }

  private call(path: string, params: any, device: LedStrip) {
    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&')
    if (query) {
      query = `?${query}`
    }

    const url = `${device.config.host}/${path}${query}`
    this.log.debug('Request:', {url})
    fetch(url).then(res => {
      this.log.debug('Response:', {
        url,
        status: res.status,
        statusText: res.statusText,
      })
    })
  }

  private position(percentage: number, _: LedStrip) {
    return Math.round(percentage * 60)
  }
}
