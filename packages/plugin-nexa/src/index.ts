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

export const HOUSE_CODES = {
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

const tellstickNexaSCReceverPattern = /arctech;model:codeswitch;house:([A-P]);unit:(1?[0-9]);method:turn((?:on)|(?:off));/

export interface NexaDevice extends Device {
  config: {
    sender: string
    houseCode: keyof typeof HOUSE_CODES
    deviceCode: number
    groupCode: number
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

          if (tellstickNexaSCReceverPattern.test(message)) {
            const [
              ,
              houseCode,
              deviceCode,
              action,
            ] = tellstickNexaSCReceverPattern.exec(message)!

            Object.values(this.state.getState().devices)
              .filter(
                d =>
                  d.pluginId === plugin.id &&
                  d.deviceClassId === plugin.deviceClasses.NexaCodeSwitch.id &&
                  (d as NexaDevice).config.houseCode === houseCode &&
                  (d as NexaDevice).config.deviceCode === +deviceCode,
              )
              .forEach(device => {
                const modification = createModification(
                  device,
                  defaultInterfaces.Power.status.on,
                  action === 'on',
                )
                this.dispatch(actions.statusUpdated, modification)
              })
          }
        }
      },
    )
  }

  onDeviceCreated(device: NexaDevice) {
    if (this.className(device).startsWith('NexaSelfLearning')) {
      device.config.deviceCode = Math.floor(Math.random() * DEVICE_CODE_MAX)
      device.config.groupCode = 7
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
        return this.codeSwitchModified(modification, device, true)
      } else {
        return this.selfLearningModified(modification, device, {
          forceOn: true,
          learn: true,
        })
      }
    } else if (
      call.interfaceId === 'NexaUnlearnAll' &&
      call.method === 'unlearnAll'
    ) {
      const modification = createModification(
        device,
        defaultInterfaces.Power.status.on,
        false,
      )
      return this.selfLearningModified(modification, device, {groupMode: true})
    }
  }

  onDeviceStatusModified(modification: Modification, device: NexaDevice) {
    if (this.className(device) === 'NexaCodeSwitch') {
      return this.codeSwitchModified(modification, device, false)
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
    {selfLearning = true, learning = false},
  ) {
    return this.callDevice({
      deviceId: senderId,
      interfaceId: defaultInterfaces['433MHzPulse'].id,
      method: defaultInterfaces['433MHzPulse'].methods.send.id,
      arguments: {
        pulse,
        repeats: learning ? 8 : selfLearning ? 5 : 8,
        pause: selfLearning ? 10 : 30,
      },
    })
  }

  private async codeSwitchModified(
    modification: Modification,
    device: NexaDevice,
    learning: boolean,
  ) {
    if (isStatus(modification, defaultInterfaces.Power.status.on)) {
      let senderId = device.config.sender
      let houseCode = HOUSE_CODES[device.config.houseCode]
      let deviceCode = device.config.deviceCode - 1

      let action = modification.value ? ON : OFF

      this.log.debug(
        `Turning ${action === ON ? 'on' : 'off'} code switch device ${
          device.name
        } ${houseCode}-${deviceCode}`,
      )

      // Send off before on for old nexa devices that would otherwise start dimming if already on
      if (modification.value) {
        await this.sendPulse(
          codeSwitchPulse(houseCode, deviceCode, OFF),
          senderId,
          {selfLearning: false, learning},
        )
      }

      await this.sendPulse(
        codeSwitchPulse(houseCode, deviceCode, action),
        senderId,
        {selfLearning: false, learning},
      )

      this.dispatch(actions.statusUpdated, {
        deviceId: device.id,
        interfaceId: defaultInterfaces.Power.id,
        statusId: defaultInterfaces.Power.status.on.id,
        value: modification.value,
      })
    }
  }

  private async selfLearningModified(
    modification: Modification,
    device: NexaDevice,
    {forceOn = false, groupMode = false, learn = false} = {},
  ) {
    const senderId = device.config.sender
    const {deviceCode, groupCode = 7} = device.config

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
          device.config.onLevel / 16 * 100,
        )
      }

      if (isStatus(modification, defaultInterfaces.Dimmer.status.level)) {
        const dimLevel = Math.round(+modification.value / 100 * 16)

        this.log.debug(`Dimming device ${device.name} to level ${dimLevel}`)
        await this.sendPulse(
          selfLearningPulse(deviceCode, groupMode, groupCode, DIM, dimLevel),
          senderId,
          {selfLearning: true, learning: learn},
        )
        this.dispatch(actions.statusUpdated, {
          deviceId: device.id,
          interfaceId: defaultInterfaces.Power.id,
          statusId: defaultInterfaces.Power.status.on.id,
          value: true,
        })
        this.dispatch(actions.statusUpdated, {
          deviceId: device.id,
          interfaceId: defaultInterfaces.Dimmer.id,
          statusId: defaultInterfaces.Dimmer.status.level.id,
          value: dimLevel / 16 * 100,
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
        selfLearningPulse(deviceCode, groupMode, groupCode, action),
        senderId,
        {selfLearning: true, learning: learn},
      )
      this.dispatch(actions.statusUpdated, {
        deviceId: device.id,
        interfaceId: defaultInterfaces.Power.id,
        statusId: defaultInterfaces.Power.status.on.id,
        value: modification.value,
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
  groupMode: boolean,
  groupCode: number,
  action: number,
  dimLevel?: number,
): Array<number> {
  const T = 26
  const T5 = T * 5
  const ZERO = [T, T, T, T5]
  const ONE = [T, T5, T, T]
  const DIM_BIT = [T, T, T, T]

  let pulse = [1, 26, 255]

  for (let i = 25; i >= 0; i--) {
    if ((deviceCode & (1 << i)) === 0) {
      pulse = pulse.concat(ZERO)
    } else {
      pulse = pulse.concat(ONE)
    }
  }

  if (groupMode) {
    pulse = pulse.concat(ONE)
  } else {
    pulse = pulse.concat(ZERO)
  }

  switch (action) {
    case ON:
      pulse = pulse.concat(ONE)
      break
    case OFF:
      pulse = pulse.concat(ZERO)
      break
    case DIM:
      pulse = pulse.concat(DIM_BIT)
      break
  }

  for (let i = 3; i >= 0; --i) {
    if ((groupCode & (1 << i)) === 0) {
      pulse = pulse.concat(ZERO)
    } else {
      pulse = pulse.concat(ONE)
    }
  }

  if (action === DIM) {
    for (let i = 3; i >= 0; --i) {
      if ((dimLevel! & (1 << i)) === 0) {
        pulse = pulse.concat(ZERO)
      } else {
        pulse = pulse.concat(ONE)
      }
    }
  }

  return pulse
}
