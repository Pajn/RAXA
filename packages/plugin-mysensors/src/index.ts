import {execFileSync} from 'child_process'
import {
  Call,
  Device,
  Modification,
  Plugin,
  actions,
  defaultInterfaces as raxaInterfaces,
  isStatus,
} from 'raxa-common'
import serialjs, {SerialPort} from 'serialport-js'
import {
  C_INTERNAL,
  C_PRESENTATION,
  C_REQ,
  C_SET,
  I_CONFIG,
  I_SKETCH_NAME,
  I_TIME,
  S_BINARY,
  S_DIMMER,
  S_RGB_LIGHT,
  S_TEMP,
  V_PERCENTAGE,
  V_RGB,
  V_STATUS,
  V_TEMP,
} from './definitions'

const gwBaud = 115200

const interfaces = {
  [S_BINARY]: raxaInterfaces.Power.id,
  [S_DIMMER]: raxaInterfaces.Dimmer.id,
  [S_RGB_LIGHT]: raxaInterfaces.Color.id,
  [S_TEMP]: raxaInterfaces.Temperature.id,
}

const statuses = {
  [V_STATUS]: raxaInterfaces.Power.status.on,
  [V_PERCENTAGE]: raxaInterfaces.Dimmer.status.level,
  [V_RGB]: raxaInterfaces.Color.status.color,
  [V_TEMP]: raxaInterfaces.Temperature.status.temp,
}

const names = {}

const serialPorts = {} as {[id: number]: any}

export interface SerialGateway extends Device {
  config: {
    serialPort: string
    [field: string]: any
  }
}

export interface Sensor extends Device {
  config: {
    gateway: number
    node: number
    sensor: number
    [field: string]: any
  }
}

function isGateway(device: Device): device is SerialGateway {
  return device.deviceClassId === 'Serial MySensors Gateway'
}

function toHex(value: number) {
  let hex = ''
  if (value < 16) {
    hex += '0'
  }
  hex += value.toString(16)
  return hex
}

function encode(destination, sensor, command, acknowledge, type, payload) {
  let message =
    destination.toString(10) +
    ';' +
    sensor.toString(10) +
    ';' +
    command.toString(10) +
    ';' +
    acknowledge.toString(10) +
    ';' +
    type.toString(10) +
    ';'

  if (command === 4) {
    for (const part of payload) {
      message += toHex(part)
    }
  } else {
    message += payload
  }
  message += '\n'
  return message
}

export default class MySensorsPlugin extends Plugin {
  onDeviceCreated(device: Sensor | SerialGateway) {
    if (isGateway(device)) {
      this.openGateway(device)
    }
  }

  onDeviceStatusModified(modification: Modification, device: Sensor) {
    const send = this.send.bind(
      this,
      device.config.gateway,
      device.config.node,
      device.config.sensor,
      C_SET,
    )

    if (isStatus(modification, raxaInterfaces.Power.status.on)) {
      return send(V_STATUS, modification.value ? 1 : 0)
    } else if (isStatus(modification, raxaInterfaces.Dimmer.status.level)) {
      return send(
        V_PERCENTAGE,
        ('00' + Math.round(+modification.value)).slice(-3),
      )
    } else if (isStatus(modification, raxaInterfaces.Color.status.color)) {
      return send(
        V_RGB,
        toHex(modification.value.red) +
          toHex(modification.value.green) +
          toHex(modification.value.blue),
      )
    }

    throw new Error(`Can't modify status of ${modification.interfaceId}`)
  }

  onDeviceCalled(call: Call, device: Sensor | SerialGateway) {
    if (isGateway(device)) {
      const {node, sensor, type, subType, payload} = call.arguments
      const message = encode(node, sensor, type, 0, subType, payload)

      this.log.debug('transmitted message', message)
      serialPorts[device.id].send(message)
    }
  }

  start() {
    this.state
      .list('devices', {
        where: {
          pluginId: 'mysensors',
          deviceClassId: 'Serial MySensors Gateway',
        },
      })
      .forEach(this.openGateway.bind(this))
  }

  stop() {
    return Promise.all(
      Object.values(serialPorts).map(
        port => new Promise(resolve => port.close(resolve)),
      ),
    )
  }

  private async openGateway({id, config}: SerialGateway) {
    const serialPort = config.serialPort
    execFileSync('stty', ['-F', serialPort, gwBaud.toString()])
    let port: SerialPort
    let errors = 0

    const open = async () => {
      port = await serialjs.open(serialPort, '\n')
      this.log.info(`connected to serial gateway at ${serialPort}`)
      serialPorts[id] = port
      return port
    }

    port = await open()

    port.on('end', () => {
      this.log.info(`disconnected from gateway at ${serialPort}`)
      delete serialPorts[id]
    })

    port.on('data', rd => {
      this.receivedMessage(id, rd)
    })

    port.on('error', () => {
      this.log.error(`connection error - trying to reconnect to ${serialPort}`)

      setTimeout(() => {
        open()
      }, errors ** 2 * 1000)
      errors++
    })
  }

  private send(deviceId, node, sensor, type, subType, payload) {
    return this.callDevice({
      deviceId,
      interfaceId: 'MySensors Gateway',
      method: 'send',
      arguments: {node, sensor, type, subType, payload},
    })
  }

  private receivedMessage(deviceId: string, message: string) {
    if (message === '') return

    this.log.debug('received message', message)

    // Decoding message
    const [sender, sensor, command /* ack */, , type, payload]: [
      number,
      number,
      number,
      boolean,
      number,
      string
    ] = message.split(';').map((p, i) => (i === 5 ? p : +p)) as any

    switch (command) {
      case C_PRESENTATION:
        this.sensorPresented(deviceId, sender, sensor, type)
        break

      case C_SET:
        this.statusUpdate(deviceId, sender, sensor, type, payload)
        break

      case C_REQ:
        this.statusRequest(deviceId, sender, sensor, type)
        break

      case C_INTERNAL:
        const send = this.send.bind(this, deviceId, sender, sensor, C_INTERNAL)

        switch (type) {
          case I_TIME:
            send(I_TIME, Math.round(Date.now() / 1000))
            break

          case I_CONFIG:
            send(I_CONFIG, 'M')
            break

          case I_SKETCH_NAME:
            this.nameReceived(deviceId, sender, payload.trim())
            break
        }

        break
    }
  }

  private getSensor(gateway, node, sensor) {
    return this.state.scalar('devices', {
      where: {
        pluginId: 'mysensors',
        deviceClassId: 'MySensors Sensor',
        config: {
          gateway,
          node,
          sensor,
        },
      },
    })
  }

  private sensorPresented(gatewayId, nodeId, sensor, type) {
    if (!interfaces[type]) return

    const device = this.getSensor(gatewayId, nodeId, sensor)

    if (!device) {
      const createDevice = () => {
        const name =
          names[`${gatewayId}:${nodeId}`] ||
          `MySensors ${interfaces[type]} ${nodeId}:${sensor}`
        const device: Sensor = {
          id: '',
          name,
          pluginId: 'mysensors',
          deviceClassId: 'MySensors Sensor',
          config: {
            gateway: gatewayId,
            node: nodeId,
            sensor,
          },
          interfaceIds: [interfaces[type]],
        }

        this.upsertDevice(device)
      }

      if (!names[`${gatewayId}:${nodeId}`]) {
        setTimeout(createDevice, 100)
      } else {
        createDevice()
      }
    }
  }

  private nameReceived(gatewayId, nodeId, name) {
    names[`${gatewayId}:${nodeId}`] = name
    setTimeout(() => {
      delete names[`${gatewayId}:${nodeId}`]
    }, 10000)
  }

  private statusUpdate(gatewayId, nodeId, sensor, type, value) {
    const status = statuses[type]
    if (!status) return
    const {interfaceId, id: statusId} = status

    switch (type) {
      case V_STATUS:
        value = +value === 1
        break

      case V_TEMP:
      case V_PERCENTAGE:
        value = +value
        break

      case V_RGB:
        value = {
          red: parseInt(value.substring(0, 2), 16),
          green: parseInt(value.substring(2, 4), 16),
          blue: parseInt(value.substring(4, 6), 16),
        }
        break

      default:
        return
    }

    const device = this.getSensor(gatewayId, nodeId, sensor)

    if (device) {
      this.dispatch(actions.statusUpdated, {
        deviceId: device.id,
        interfaceId,
        statusId,
        value,
      })
    } else {
      if (type === V_TEMP) {
        const name =
          names[`${gatewayId}:${nodeId}`] ||
          `MySensors ${interfaces[S_TEMP]} ${nodeId}:${sensor}`
        const device: Sensor = {
          id: '',
          name,
          pluginId: 'mysensors',
          deviceClassId: 'MySensors Sensor',
          config: {
            gateway: gatewayId,
            node: nodeId,
            sensor,
          },
          interfaceIds: [interfaces[S_TEMP]],
        }

        this.upsertDevice(device).then(device => {
          this.dispatch(actions.statusUpdated, {
            deviceId: device.id,
            interfaceId,
            statusId,
            value,
          })
        })
      }
    }
  }

  private async statusRequest(gatewayId, nodeId, sensor, type) {
    const status = statuses[type]
    if (!status) return
    const {interfaceId, id: statusId} = status
    const device = this.getSensor(gatewayId, nodeId, sensor)

    if (device) {
      const value = await this.state.scalar({
        status: {[device.id]: {[interfaceId]: statusId}},
      })

      this.onDeviceStatusModified(
        {
          deviceId: device.id,
          interfaceId,
          statusId,
          value,
        },
        device as Sensor,
      )
    }
  }
}
