import {GraphQLString} from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import {buildQueries, buildMutations, buildType} from 'graphql-verified'
import * as joi from 'joi'
import {Device, DeviceStatus, Call, Modification} from 'raxa-common'
import {Context} from './context'
import {DeviceClassType} from './device-class'
import {InterfaceType} from './interface'

export const DeviceStatusType = buildType<DeviceStatus>({
  name: 'DeviceStatus',
  fields: {
    id: {type: GraphQLString},
    interfaceId: {type: GraphQLString},
    statusId: {type: GraphQLString},
    value: {type: GraphQLString},
  },
  readRules: false,
  writeRules: false,
})

function flatMap<T, U>(array: T[], mapFunc: (x: T) => U[]) : U[] {
  return array.reduce((cumulus: U[], next: T) => [...mapFunc(next), ...cumulus], <U[]> [])
}

function getValue<T, A extends keyof T, B extends keyof T[A], C extends keyof T[A][B]>(object: T, path: [A, B, C]): T[A][B][C]
function getValue<T, A extends keyof T, B extends keyof T[A]>(object: T, path: [A, B]): T[A][B]
function getValue<T, A extends keyof T>(object: T, path: [A]): T[A]
function getValue(object: any, path: Array<string|number>): any {
  return path.reduce((object, key) => object && object[key], object)
}

export const DeviceType = buildType<Device>({
  name: 'Device',
  fields: {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    pluginId: {type: GraphQLString},
    deviceClassId: {type: GraphQLString},
    deviceClass: {
      type: DeviceClassType,
      validate: joi.object({}),
      resolve({deviceClassId}, {}, {storage}: Context) {
        return storage.getState().deviceClasses[deviceClassId]
      },
    },
    config: {type: GraphQLJSON},
    interfaceIds: {type: [GraphQLString]},
    interfaces: {
      type: [InterfaceType],
      validate: joi.object({}),
      resolve({interfaces}, {}, {storage}: Context) {
        const state = storage.getState()
        return interfaces.map(iface => state.interfaces[iface])
      },
    },
    status: {
      type: [DeviceStatusType],
      validate: joi.object({
        interfaceIds: joi.array().items(joi.string().required()),
      }),
      resolve(device: Device, {interfaceIds: specifiedInterfaces}, {storage}: Context) {
        const state = storage.getState()
        const interfaces = (specifiedInterfaces as string[]) || device.interfaceIds
        return interfaces && flatMap(interfaces, interfaceId => {
          const iface = state.interfaces[interfaceId]
          if (!iface.status) return []
          return Object.keys(iface.status).map(statusId => ({
            id: `${device.id}:${interfaceId}:${statusId}`,
            interfaceId,
            statusId,
            value: getValue(state.status, [device.id, interfaceId, statusId]),
          }))
        })
      },
    }
    // variables?: {
    //     [interfaceId: string]: {
    //         [variableName: string]: any;
    //     };
    // };
  } as any,
  readRules: false,
  writeRules: false,
})

export const deviceQueries = buildQueries({
  devices: {
    type: [DeviceType],
    validate: joi.object({}),
    resolve(_, {}, {storage}: Context) {
      return Object.values(storage.getState().devices)
    },
  },
})

export const deviceMutations = buildMutations({
  upsertDevice: {
    type: DeviceType,
    validate: joi.object({
      device: joi.object({
        id: joi.string().optional(),
        name: joi.string().required(),
        pluginId: joi.string().required(),
        deviceClassId: joi.string().required(),
        config: joi.object(),
      }),
    }),
    args: {
      device: {type: DeviceType},
    },
    writeRules: false,
    async resolve(_, {device}: {device: Device}, {storage}: Context) {
      storage.upsertDevice(device)
    },
  },
  callDevice: {
    type: DeviceType,
    validate: joi.object({
      deviceId: joi.string(),
      interfaceId: joi.string(),
      method: joi.string(),
      arguments: joi.string(),
    }),
    writeRules: false,
    async resolve(_, call: Call, {plugins}: Context) {
      plugins.callDevice(call)
    },
  },
  setDeviceStatus: {
    type: DeviceType,
    validate: joi.object({
      deviceId: joi.string(),
      interfaceId: joi.string(),
      statusId: joi.string(),
      value: joi.string(),
    }),
    writeRules: false,
    async resolve(_, modification: Modification, {plugins}: Context) {
      plugins.setDeviceStatus(modification)
    },
  },
})
