/* tslint:disable:no-bitwise */
import {Call, Config, Device, Plugin} from 'raxa-common'

const ON = 0
const OFF = 1
const DIM = 2

const HOUSE_CODES = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
}

const DEVICE_CODE_MAX = 67234433

export interface NexaDevice extends Device {
  config: {
    sender: Config<number>,
    houseCode: Config<number>,
    deviceCode: Config<number>,
    onLevel: Config<number>,
    [field: string]: Config<any>,
  }

  status: {
    Lamp: {on: boolean},
    DimLevelLamp: {level: number},
    [interfaceName: string]: {},
  }
}

export default class NexaPlugin extends Plugin {
  onDeviceCreated(device: NexaDevice) {
    if (this.className(device).startsWith('NexaSelfLearning')) {
      device.config.deviceCode.value = Math.floor(Math.random() * DEVICE_CODE_MAX)
      return device
    }
  }

  onDeviceCalled(call: Call, device: NexaDevice) {
    if (this.className(device) === 'NexaCodeSwitch') {
      return this.codeSwitchCalled(call, device)
    } else {
      return this.selfLearningCalled(call, device)
    }
  }

  private className(device: Device) {
    return this.getState().deviceClasses[device.deviceClass].name
  }

  private sendPulse(pulse: Array<number>, senderId: number) {
    super.callDevice({
      deviceId: senderId,
      interface: '433MHzPulse',
      method: 'send',
      arguments: {
        pulse: pulse,
        repeats: 8,
        pause: 10,
      },
    })
  }

  private codeSwitchCalled(call: Call, device: NexaDevice) {
    if (call.interface === 'SelfLearning' && call.method === 'learn') {
      call.interface = 'Lamp'
      call.method = 'on'
    }

    if (call.interface === 'Lamp') {
      let senderId = device.config.sender.value
      let houseCode = HOUSE_CODES[device.config.houseCode.value]
      let deviceCode = device.config.deviceCode.value - 1

      let action = (call.method === 'on') ? ON : OFF

      this.sendPulse(codeSwitchPulse(houseCode, deviceCode, action), senderId)

      device.status.Lamp.on = action === ON

      return device
    }
  }

  private selfLearningCalled(call: Call, device: NexaDevice) {
    const senderId = device.config.sender.value
    const deviceCode = device.config.deviceCode.value

    if (this.className(device) === 'NexaSelfLearningDimable') {
      if (call.interface === 'Lamp' && call.method === 'on') {
        call.interface = 'DimLevel'
        call.method = 'level'
        call.arguments = {level: device.config.onLevel.value}
      }

      if (call.interface === 'DimLevelLamp' && call.method === 'level') {
        const dimLevel = call.arguments.level

        this.sendPulse(selfLearningPulse(deviceCode, 7, DIM, dimLevel), senderId)

        device.status.Lamp.on = true
        device.status.DimLevelLamp.level = dimLevel

        return device
      }
    }

    if (call.interface === 'SelfLearning' && call.method === 'learn') {
      call.interface = 'Lamp'
      call.method = 'on'
    }

    if (call.interface === 'Lamp') {
      let action = (call.method === 'on') ? ON : OFF

      this.sendPulse(selfLearningPulse(deviceCode, 7, action), senderId)

      device.status.Lamp.on = action === ON
      if (this.className(device) === 'NexaSelfLearningDimable') {
        device.status.DimLevelLamp.level = 0
      }

      return device
    }
  }
}

function codeSwitchPulse(houseCode: number, deviceCode: number, action: number): Array<number> {
  let pulse = []

  for (let i = 0; i < 4; i++) {
    if ((houseCode & 1) !== 0) {
      pulse = pulse.concat([36, 107, 107, 36]) // 1
    } else {
      pulse = pulse.concat([36, 107, 36, 107]) // 0
    }
    houseCode >>= 1
  }

  for (let i = 0; i < 4; i++) {
    if ((deviceCode & 1) !== 0) {
      pulse = pulse.concat([36, 107, 107, 36]) // 1
    } else {
      pulse = pulse.concat([36, 107, 36, 107]) // 0
    }
    deviceCode >>= 1
  }

  if (action === OFF) {
    pulse = pulse.concat([
      36,
      107,
      36,
      107,
      36,
      107,
      107,
      36,
      36,
      107,
      107,
      36,
      36,
      107,
      36,
      107,
      36,
      107,
    ])
  } else {
    pulse = pulse.concat([
      36,
      107,
      36,
      107,
      36,
      107,
      107,
      36,
      36,
      107,
      107,
      36,
      36,
      107,
      107,
      36,
      36,
      107,
    ])
  }

  return pulse
}

function selfLearningPulse(deviceCode: number, groupCode: number,
                           action: number, dimLevel?: number): Array<number> {
  const ONE = [29, 17]
  const ZERO = [29, 92]

  let pulse = [29, 255]

  for (let i = 25; i >= 0; i--) {
    if ((deviceCode & 1 << i) !== 0) {
      pulse = pulse.concat(ONE, ZERO)
    } else {
      pulse = pulse.concat(ZERO, ONE)
    }
  }

  // Group is disabled
  pulse = pulse.concat(ZERO, ONE)

  switch (action) {
    case ON:
      pulse = pulse.concat(ZERO, ONE)
      break
    case OFF:
      pulse = pulse.concat(ONE, ZERO)
      break
    case DIM:
      pulse = pulse.concat(ONE, ONE)
      break
  }

  for (let i = 3; i >= 0; --i) {
    if ((groupCode & 1 << i) !== 0) {
      pulse = pulse.concat(ONE, ZERO)
    } else {
      pulse = pulse.concat(ZERO, ONE)
    }
  }

  if (action === DIM) {
    for (let i = 3; i >= 0; --i) {
      if ((dimLevel & 1 << i) !== 0) {
        pulse = pulse.concat(ZERO, ONE)
      } else {
        pulse = pulse.concat(ONE, ZERO)
      }
    }
  }

  pulse = pulse.concat(ZERO)

  return pulse
}
