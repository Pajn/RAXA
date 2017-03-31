/* tslint:disable:no-empty */
import {remoteProcedures} from 'nes-advantage'
import {Call, Device, Modification} from 'raxa-common'

@remoteProcedures()
class Devices {
  async createDevice(device: Device) {}
  async callDevice(call: Call) {}
  async deleteDevice(deviceId: number) {}
  async modifyDeviceStatus(modification: Modification) {}
}

export const devices = new Devices()
