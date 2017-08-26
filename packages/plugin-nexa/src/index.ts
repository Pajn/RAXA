/* tslint:disable:no-bitwise */
import {
  Call,
  Device,
  Modification,
  Plugin,
  actions,
  createModification,
  defaultInterfaces,
  isStatus,
} from 'raxa-common'
import raxaTellstickNet from 'raxa-plugin-raxa-tellsticknet/cjs/plugin'
import plugin from './plugin'

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
    sender: string
    houseCode: number
    deviceCode: number
    onLevel: number
  }

  status: {
    Power: {on: boolean}
    Dimmer: {level: number}
  }
}

export default class NexaPlugin extends Plugin {
  start() {
    this.listenOn(
      raxaTellstickNet.interfaces.TellstickReceived.id,
      raxaTellstickNet.interfaces.TellstickReceived.events.message.id,
      (message: string) => {
        if (message.startsWith('arctech;model')) {
          this.fireEvent(
            defaultInterfaces.Trigger.id,
            defaultInterfaces.Trigger.events.triggered.id,
            {
              pluginId: plugin.id,
              triggerId: message,
            },
          )
        }
      },
    )
  }

  onDeviceCreated(device: NexaDevice) {
    if (this.className(device).startsWith('NexaSelfLearning')) {
      device.config.deviceCode = Math.floor(Math.random() * DEVICE_CODE_MAX)
      return device
    }
  }

  onDeviceCalled(call: Call, device: NexaDevice) {
    if (
      call.interfaceId === defaultInterfaces.SelfLearning.id &&
      call.method === defaultInterfaces.SelfLearning.methods.learn.id
    ) {
      const modification = createModification(
        device,
        defaultInterfaces.Power.status.on,
        true,
      )
      if (this.className(device) === 'NexaCodeSwitch') {
        return this.codeSwitchModified(modification, device)
      } else {
        return this.selfLearningModified(modification, device, true)
      }
    }
  }

  onDeviceStatusModified(modification: Modification, device: NexaDevice) {
    console.log('onDeviceStatusModified', modification)
    if (this.className(device) === 'NexaCodeSwitch') {
      return this.codeSwitchModified(modification, device)
    } else {
      return this.selfLearningModified(modification, device)
    }
  }

  private className(device: Device) {
    return this.state.scalar('deviceClasses', {
      where: {id: device.deviceClassId},
    }).name
  }

  private sendPulse(
    pulse: Array<number>,
    senderId: string,
    selfLearning: boolean,
  ) {
    return this.callDevice({
      deviceId: senderId,
      interfaceId: defaultInterfaces['433MHzPulse'].id,
      method: defaultInterfaces['433MHzPulse'].methods.send.id,
      arguments: {
        pulse,
        repeats: selfLearning ? 5 : 8,
        pause: selfLearning ? 10 : 30,
      },
    })
  }

  private async codeSwitchModified(
    modification: Modification,
    device: NexaDevice,
  ) {
    if (isStatus(modification, defaultInterfaces.Power.status.on)) {
      let senderId = device.config.sender
      let houseCode = (HOUSE_CODES as any)[device.config.houseCode]
      let deviceCode = device.config.deviceCode - 1

      let action = modification.value ? ON : OFF

      this.log.debug(
        `Turning ${action === ON
          ? 'on'
          : 'off'} code switch device ${device.name} ${houseCode}-${deviceCode}`,
      )

      await this.sendPulse(
        codeSwitchPulse(houseCode, deviceCode, action),
        senderId,
        false,
      ).then(() => {
        return this.dispatch(actions.statusUpdated, {
          deviceId: device.id,
          interfaceId: defaultInterfaces.Power.id,
          statusId: defaultInterfaces.Power.status.on.id,
          value: modification.value,
        })
      })
    }
  }

  private async selfLearningModified(
    modification: Modification,
    device: NexaDevice,
    forceOn = false,
  ) {
    const senderId = device.config.sender
    const deviceCode = device.config.deviceCode

    if (
      this.className(device) === plugin.deviceClasses.NexaSelfLearningDimable.id
    ) {
      if (
        !forceOn &&
        isStatus(modification, defaultInterfaces.Power.status.on) &&
        modification.value
      ) {
        modification = createModification(
          device,
          defaultInterfaces.Dimmer.status.level,
          device.config.onLevel,
        )
      }

      if (isStatus(modification, defaultInterfaces.Dimmer.status.level)) {
        const dimLevel = Math.round(+modification.value / 100 * 16)

        this.log.debug(`Dimming device ${device.name} to level ${dimLevel}`)
        await this.sendPulse(
          selfLearningPulse(deviceCode, 7, DIM, dimLevel),
          senderId,
          true,
        )
          .then(() => {
            return this.dispatch(actions.statusUpdated, {
              deviceId: device.id,
              interfaceId: defaultInterfaces.Power.id,
              statusId: defaultInterfaces.Power.status.on.id,
              value: true,
            })
          })
          .then(() => {
            return this.dispatch(actions.statusUpdated, {
              deviceId: device.id,
              interfaceId: defaultInterfaces.Dimmer.id,
              statusId: defaultInterfaces.Dimmer.status.level.id,
              value: dimLevel / 16 * 100,
            })
          })

        return
      }
    }

    if (isStatus(modification, defaultInterfaces.Power.status.on)) {
      let action = modification.value ? ON : OFF

      this.log.debug(
        `Turning ${action === ON ? 'on' : 'off'} device ${device.name}`,
      )

      await this.sendPulse(
        selfLearningPulse(deviceCode, 7, action),
        senderId,
        true,
      ).then(() => {
        return this.dispatch(actions.statusUpdated, {
          deviceId: device.id,
          interfaceId: defaultInterfaces.Power.id,
          statusId: defaultInterfaces.Power.status.on.id,
          value: modification.value,
        })
      })
    }
  }
}

function codeSwitchPulse(
  houseCode: number,
  deviceCode: number,
  action: number,
): Array<number> {
  let pulse: Array<number> = []

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

function selfLearningPulse(
  deviceCode: number,
  groupCode: number,
  action: number,
  dimLevel?: number,
): Array<number> {
  const ONE = [25, 25]
  const ZERO = [25, 125]

  let pulse = [29, 255]

  for (let i = 25; i >= 0; i--) {
    if ((deviceCode & (1 << i)) !== 0) {
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
    if ((groupCode & (1 << i)) !== 0) {
      pulse = pulse.concat(ONE, ZERO)
    } else {
      pulse = pulse.concat(ZERO, ONE)
    }
  }

  if (action === DIM) {
    for (let i = 3; i >= 0; --i) {
      if ((dimLevel! & (1 << i)) !== 0) {
        pulse = pulse.concat(ZERO, ONE)
      } else {
        pulse = pulse.concat(ONE, ZERO)
      }
    }
  }

  pulse = pulse.concat(ZERO)

  return pulse
}
