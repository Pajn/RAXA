import fetch from 'node-fetch'
import {Queue} from 'promise-land'
import {
  Call,
  Device,
  Modification,
  Plugin,
  actions,
  defaultInterfaces,
  isStatus,
} from 'raxa-common'

export interface Receiver extends Device {
  config: {
    host: string
    [field: string]: any
  }
}

export default class SonyReceiverPlugin extends Plugin {
  executionQueue = new Queue()

  async onDeviceStatusModified(modification: Modification, device: Receiver) {
    if (isStatus(modification, defaultInterfaces.Power.status.on)) {
      console.log('defaultInterfaces', defaultInterfaces)
      const state = this.state.getState()
      const isOn =
        (state.status[device.id] &&
          state.status[device.id][defaultInterfaces.Power.id] &&
          state.status[device.id][defaultInterfaces.Power.id][
            defaultInterfaces.Power.status.on.id
          ]) ||
        false
      if (isOn && modification.value) return

      const code = '540C'
      await this.sendCode(device, code)
      await this.dispatch(actions.statusUpdated, {
        deviceId: device.id,
        interfaceId: defaultInterfaces.Power.id,
        statusId: defaultInterfaces.Power.status.on.id,
        value: modification.value,
      })
    }
  }

  async onDeviceCalled({method}: Call, device: Receiver) {
    console.log('device', device)
    const {code, repeat, powerOn} = (() => {
      switch (method) {
        case 'volUp':
          return {code: '240C', repeat: 2, powerOn: false}
        case 'volDown':
          return {code: '640C', repeat: 2, powerOn: false}
        case 'tv':
          return {code: '600D', repeat: undefined, powerOn: true}
        case 'speakers':
          return {code: '3C0C', repeat: undefined, powerOn: true}
        default:
          return {code: undefined, repeat: undefined, powerOn: false}
      }
    })()
    if (code) {
      if (powerOn) {
        await this.onDeviceStatusModified(
          {
            deviceId: device.id,
            interfaceId: defaultInterfaces.Power.id,
            statusId: defaultInterfaces.Power.status.on.id,
            value: true,
          },
          device,
        )
      }
      await this.sendCode(device, code, repeat)
    }
  }

  private async sendCode(device: Receiver, code: string, repeat?: number) {
    const url = `http://${device.config
      .host}/msg?code=${code}:SONY:15&simple=1${repeat
      ? `&repeat=${repeat}`
      : ''}`
    await this.executionQueue.add(
      () => (this.log.debug('fetch', url), fetch(url)),
    )
  }
}
