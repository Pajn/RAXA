import {GraphQLString} from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import {buildMutations, buildQueries, buildType} from 'graphql-verified'
import * as joi from 'joi'
import {Call, Device, DeviceStatus, Modification} from 'raxa-common'
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

export function flatMap<T, U>(
  array: Array<T>,
  mapFunc: (x: T) => Array<U>,
): Array<U> {
  return array.reduce(
    (cumulus: Array<U>, next: T) => [...mapFunc(next), ...cumulus],
    [] as Array<U>,
  )
}

export function getValue<
  T,
  A extends keyof T,
  B extends keyof T[A],
  C extends keyof T[A][B]
>(object: T, path: [A, B, C]): T[A][B][C]
export function getValue<T, A extends keyof T, B extends keyof T[A]>(
  object: T,
  path: [A, B],
): T[A][B]
export function getValue<T, A extends keyof T>(object: T, path: [A]): T[A]
export function getValue(object: any, path: Array<string | number>): any {
  return path.reduce((object, key) => object && object[key], object)
}

export const DeviceType = buildType<Device>({
  name: 'Device',
  fields: {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    pluginId: {
      type: GraphQLString,
    },
    deviceClassId: {
      type: GraphQLString,
    },
    deviceClass: {
      type: DeviceClassType,
      validate: joi.object({}),
      resolve({deviceClassId}: Device, {}, {storage}: Context) {
        return storage.getState().deviceClasses[deviceClassId]
      },
    },
    config: {type: GraphQLJSON},
    interfaceIds: {
      type: [GraphQLString],
      isInput: false,
      validate: joi.object({}),
      resolve({interfaceIds, deviceClassId}: Device, {}, {storage}: Context) {
        return (
          interfaceIds ||
          storage.getState().deviceClasses[deviceClassId].interfaceIds
        )
      },
    },
    interfaces: {
      type: [InterfaceType],
      validate: joi.object({}),
      resolve({interfaceIds = []}: Device, {}, {storage}: Context) {
        const state = storage.getState()
        return interfaceIds.map(iface => state.interfaces[iface])
      },
    },
    status: {
      type: [DeviceStatusType],
      validate: joi.object({
        interfaceIds: joi.array().items(joi.string().required()),
        statusIds: joi.array().items(joi.string().required()),
      }),
      resolve(
        device: Device,
        {
          interfaceIds: specifiedInterfaces,
          statusIds: specifiedStatusIds,
        }: {interfaceIds: Array<string>; statusIds: Array<string>},
        {storage}: Context,
      ) {
        const state = storage.getState()
        const interfaces = specifiedInterfaces || device.interfaceIds
        return (
          interfaces &&
          flatMap(interfaces, interfaceId => {
            const iface = state.interfaces[interfaceId]
            if (!iface.status) return []
            const statusIds = specifiedStatusIds || Object.keys(iface.status)
            return statusIds.map(statusId => ({
              id: `${device.id}:${interfaceId}:${statusId}`,
              interfaceId,
              statusId,
              value: getValue(state.status, [device.id, interfaceId, statusId]),
            }))
          })
        )
      },
    },
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
  device: {
    type: DeviceType,
    validate: joi.object({
      id: joi.string().required(),
    }),
    resolve(_, {id}, {storage}: Context) {
      return storage.getState().devices[id]
    },
  },
  devices: {
    type: [DeviceType],
    validate: joi.object({
      interfaceIds: joi.array().items(joi.string().required()).allow(null),
      deviceClassIds: joi.array().items(joi.string().required()).allow(null),
    }),
    resolve(
      _,
      {
        interfaceIds,
        deviceClassIds,
      }: {interfaceIds: Array<string>; deviceClassIds: Array<string>},
      {storage}: Context,
    ) {
      const state = storage.getState()
      let devices = Object.values(state.devices)
      if (interfaceIds) {
        devices = devices.filter(device => {
          const a =
            device.interfaceIds ||
            state.deviceClasses[device.deviceClassId].interfaceIds
          return a.some(id => interfaceIds.includes(id))
        })
      }
      if (deviceClassIds) {
        devices = devices.filter(device =>
          deviceClassIds.includes(device.deviceClassId),
        )
      }
      return devices
    },
  },
})

export const deviceMutations = buildMutations({
  upsertDevice: {
    type: DeviceType,
    validate: joi.object({
      device: joi
        .object({
          id: joi.string().optional(),
          name: joi.string().required(),
          pluginId: joi.string(),
          deviceClassId: joi.string(),
          config: joi.object(),
        })
        .xor('id', 'pluginId')
        .xor('id', 'deviceClassId')
        .and('pluginId', 'deviceClassId'),
    }),
    args: {
      device: {type: DeviceType},
    },
    writeRules: false,
    async resolve(_, {device}: {device: Device}, {storage}: Context) {
      return storage.upsertDevice(device)
    },
  },
  callDevice: {
    type: DeviceType,
    validate: joi.object({
      deviceId: joi.string(),
      interfaceId: joi.string(),
      method: joi.string(),
      // arguments: joi.string(),
    }),
    writeRules: false,
    async resolve(_, call: Call, {storage, plugins}: Context) {
      plugins.callDevice(call)
      const state = storage.getState()
      return state.devices[call.deviceId]
    },
  },
  setDeviceStatus: {
    type: DeviceStatusType,
    validate: joi.object({
      deviceId: joi.string(),
      interfaceId: joi.string(),
      statusId: joi.string(),
      value: joi.string(),
    }),
    writeRules: false,
    async resolve(_, modification: Modification, {plugins, storage}: Context) {
      await plugins.setDeviceStatus(modification)
      const state = storage.getState()
      return (
        state.status[modification.deviceId] &&
        state.status[modification.deviceId][modification.interfaceId] &&
        state.status[modification.deviceId][modification.interfaceId][
          modification.statusId
        ]
      )
    },
  },
})
