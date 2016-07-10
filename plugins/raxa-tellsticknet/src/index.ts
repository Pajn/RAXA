import * as dgram from 'dgram'
import iconv from 'iconv-lite'
import {Call, Config, Device, Plugin} from 'raxa-common'

const COMMUNICATION_PORT = 42314
const BROADCAST_PORT = 30303

export interface Tellstick extends Device {
  config: {
    activationCode: Config<string>,
    [field: string]: Config<any>,
  }
}

const CLEAR_INTERVAL_MS = 1000 * 60 * 15

export default class RaxaTellstickNetPlugin extends Plugin {
  private cleanupIntervalId: number
  private socket: dgram.Socket
  private tellsticks = {}

  onDeviceCalled(call: Call, device: Tellstick) {
    if (call.interface === '433MHzPulse' && call.method === 'send') {
      const pulse = call.arguments.pulse
      const repeats = call.arguments.repeats
      const pause = call.arguments.pause

      const activationCode = device.config.activationCode.value
      const pulseString = iconv.decode(new Buffer(pulse), 'latin1')

      return this.send(
        `4:sendh1:S${pulse.length.toString(16).toUpperCase()}:${pulseString}` +
        `1:Pi${pause.toString(16).toUpperCase()}s` +
        `1:Ri${repeats.toString(16).toUpperCase()}ss`,
        activationCode
      )
    }
  }

  async start() {
    this.socket = dgram.createSocket('udp4')

    await this.listenToSocket()

    this.cleanupIntervalId = setInterval(this.runCleanup(), CLEAR_INTERVAL_MS)
  }

  async stop() {
    clearInterval(this.cleanupIntervalId)
    return new Promise(resolve => this.socket.close(resolve))
  }

  async find() {
    const buffer = iconv.encode('D', 'latin1')

    return this.sendBuffer(buffer, '255.255.255.255', BROADCAST_PORT)
  }

  async send(message: string, activationCode: string) {
    const buffer = iconv.encode(message, 'latin1')
    const ip = await this.getIp(activationCode)
    this.log.debug(`Sending ${message} to tellstick ${activationCode} with ip ${ip}`)

    return this.sendBuffer(buffer, ip, COMMUNICATION_PORT)
  }

  private async listenToSocket() {
    await new Promise((resolve, reject) => {
      this.socket.bind(COMMUNICATION_PORT, () => {
        this.socket.setBroadcast(true)
        resolve(this.runCleanup())
        this.socket.removeListener('error', reject)
      })
      this.socket.once('error', reject)
    })

    this.socket.on('message', (buffer, sender) => {
      const message = iconv.decode(buffer, 'latin1').trim()

      if (message.startsWith('TellStickNet')) {
        const [, mac, activationCode, version] = message.split(':')

        if (!this.tellsticks[activationCode]) {
          this.log.debug(`Found tellstick on ${sender.address} with banner ${message}`)
        }

        this.tellsticks[activationCode] = {
          address: sender.address,
          time: Date.now(),
        }
      } else if (message.startsWith('TSNETRCprotocol:') && !message.endsWith('data:;')) {
        this.log.debug(`${sender.address}: ${message}`)
      }
    })

    this.socket.on('')
  }

  private async runCleanup() {
    await this.find()

    Object.keys(this.tellsticks).forEach((activationCode) => {
      const tellstick = this.tellsticks[activationCode]

      if (Date.now() - tellstick.time > CLEAR_INTERVAL_MS) {
        this.tellsticks[activationCode] = null
      }
    })
  }

  private async getIp(activationCode: string) {
    const numberOfTries = 20
    const tryIntervalMs = 100

    if (this.tellsticks[activationCode]) {
      return this.tellsticks[activationCode].address
    }

    for (let attempt = 0; attempt <= numberOfTries; attempt++) {
      if (attempt >= numberOfTries) {
        throw `No TellstickNet with activation code ${activationCode} found`
      }

      await this.find()

      if (this.tellsticks[activationCode]) {
        return this.tellsticks[activationCode].address
      }

      await new Promise(resolve => setTimeout(resolve, tryIntervalMs))
    }
  }

  private async sendBuffer(buffer: Buffer, ip: string, port: number) {
    return new Promise((resolve, reject) => {
      this.socket.send(buffer, 0, buffer.length, port, ip, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}
