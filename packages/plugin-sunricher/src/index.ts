import Color from 'color-js'
import net from 'net'
import {
  Call,
  Device,
  Modification,
  Plugin,
  actions,
  defaultInterfaces,
} from 'raxa-common'

export interface Sunricher extends Device {
  config: {
    host: string
    [field: string]: any
  }
}

const cr = 0
const cy = -20
const cg = -20
const cc = -25
const cb = 0
const cm = -10

/**
 * calculate the distance of two given hues
 */
function hueDistance(hue: number, testHue: number) {
  const a = (360 + hue - testHue) % 360
  const b = (360 + testHue - hue) % 360
  return Math.min(a, b)
}

function colorCorrect(hue: number) {
  const toR = hueDistance(0, hue)
  const toY = hueDistance(60, hue)
  const toG = hueDistance(120, hue)
  const toC = hueDistance(180, hue)
  const toB = hueDistance(240, hue)
  const toM = hueDistance(300, hue)

  let correction = 0
  if (Math.abs(toR) <= 60) correction += cr - cr * toR / 60
  if (Math.abs(toY) <= 60) correction += cy - cy * toY / 60
  if (Math.abs(toG) <= 60) correction += cg - cg * toG / 60
  if (Math.abs(toC) <= 60) correction += cc - cc * toC / 60
  if (Math.abs(toB) <= 60) correction += cb - cb * toB / 60
  if (Math.abs(toM) <= 60) correction += cm - cm * toM / 60

  return Math.round(hue + correction) % 360
}

export default class SunricherPlugin extends Plugin {
  start() {}

  stop() {}

  onDeviceStatusModified(
    {interfaceId, statusId, value}: Modification,
    device: Sunricher,
  ) {
    this.log.debug('Setting sunricher', device.name)

    if (
      interfaceId === defaultInterfaces.Power.id &&
      statusId === defaultInterfaces.Power.status.on.id
    ) {
      this.setPower(value, device)
    } else if (
      interfaceId === defaultInterfaces.Dimmer.id &&
      statusId === defaultInterfaces.Dimmer.status.level.id
    ) {
      this.setDimLevel(value, device)
    } else if (
      interfaceId === defaultInterfaces.Color.id &&
      statusId === defaultInterfaces.Color.status.color.id
    ) {
      this.setColor(value, device)
    }
  }

  private isOn(device: Sunricher) {
    return (
      ((this.state.getState().status[device.id] || {})[
        defaultInterfaces.Power.id
      ] || {})[defaultInterfaces.Power.status.on.id] || false
    )
  }

  private async setPower(value: boolean, device: Sunricher) {
    await this.sendCommand(
      value ? [0x02, 0x12, 0xab] : [0x02, 0x12, 0xa9],
      device,
    )
    this.dispatch(actions.statusUpdated, {
      deviceId: device.id,
      interfaceId: defaultInterfaces.Power.id,
      statusId: defaultInterfaces.Power.status.on.id,
      value,
    })
  }

  private async setDimLevel(value: number, device: Sunricher) {
    const dimLevel = Math.round(+value / 100 * 9)
    if (dimLevel > 0 && !this.isOn(device)) {
      await this.setPower(true, device)
    }
    await this.sendCommand([0x08, 0x23, dimLevel], device)
    this.dispatch(actions.statusUpdated, {
      deviceId: device.id,
      interfaceId: defaultInterfaces.Dimmer.id,
      statusId: defaultInterfaces.Dimmer.status.level.id,
      value: dimLevel / 9 * 100,
    })
  }

  private async setColor(value: number, device: Sunricher) {
    value = +value
    const color = Color([
      (value & 0xff0000) >> 16,
      (value & 0x00ff00) >> 8,
      value & 0x0000ff,
    ])

    if (value > 0 && !this.isOn(device)) {
      await this.setPower(true, device)
    }

    color.setHue(colorCorrect(color.getHue()))

    const gamma = 0.65

    color.setRed(color.getRed() ** 1 / gamma)
    color.setGreen(color.getGreen() ** 1 / gamma)
    color.setBlue(color.getBlue() ** 1 / gamma)

    let red = Math.round(color.getRed() * 0x80)
    let green = Math.round(color.getGreen() * 0x80)
    let blue = Math.round(color.getBlue() * 0x80)

    await this.sendCommand([0x08, 0x18, red], device)
    await this.sendCommand([0x08, 0x19, green], device)
    await this.sendCommand([0x08, 0x20, blue], device)

    this.dispatch(actions.statusUpdated, {
      deviceId: device.id,
      interfaceId: defaultInterfaces.Color.id,
      statusId: defaultInterfaces.Color.status.color.id,
      value,
    })

    this.dispatch(actions.statusUpdated, {
      deviceId: device.id,
      interfaceId: defaultInterfaces.Dimmer.id,
      statusId: defaultInterfaces.Dimmer.status.level.id,
      value: color.getLightness() * 100,
    })
  }

  private sendCommand(command: Array<number>, device: Sunricher) {
    const fullCommand = [
      // Header
      0x55,
      // Remote id
      0x39,
      0x38,
      0x32,
      // Command header
      0x02,
      // Zone 0 = all?
      0x00,
      ...command,
      // Checksum
      (0x02 + command.reduce((acc, val) => acc + val, 0)) & 0x0000ff,
      // Footer
      0xaa,
      0xaa,
    ]

    return new Promise((resolve, reject) => {
      const socket = net.connect(8899, device.config.host, (err: any) => {
        if (err) return reject(err)

        socket.write(new Buffer(fullCommand), (err: any) => {
          socket.destroy()
          if (err) return reject(err)
          resolve()
        })
      })
    })
  }
}
