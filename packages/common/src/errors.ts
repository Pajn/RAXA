import {Device} from './entities'

export type RaxaError =
  | {type: 'pluginNotEnabled'; pluginId: string}
  | {type: 'missingDevice'; deviceId: string}
  | {type: 'missingDeviceClass'; deviceClassId: string}
  | {type: 'missingInterface'; interfaceId: string}
  | {type: 'invalidDevice'; joiError: any}
  | {type: 'invalidInterface'; joiError: any}
  | {type: 'invalidDeviceClass'; joiError: any}
  | {type: 'missingStatus'; interfaceId: string; statusId: string}
  | {type: 'missingMethod'; interfaceId: string; method: string}
  | {
      type: 'invalidArguments'
      interfaceId: string
      method: string
      joiError: any
    }
  | {type: 'interfaceNotImplemented'; deviceId: string; interfaceId: string}
  | DeviceIsInUseError

export type DeviceIsInUseError = {type: 'deviceIsInUse'; devices: Array<Device>}

export function raxaError(error: RaxaError) {
  return Object.assign(new Error(JSON.stringify(error)), error)
}

export function isRaxaError(error: any): error is RaxaError {
  return error && typeof error.type === 'string'
}
