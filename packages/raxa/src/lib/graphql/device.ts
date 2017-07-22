import {GraphQLString} from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import {buildMutations, buildQueries, buildType} from 'graphql-verified'
import * as joi from 'joi'
import {
  Call,
  Device,
  DeviceClass,
  DeviceStatus,
  GraphQlDevice,
  Modification,
  actions,
  raxaError,
} from 'raxa-common'
import {compose} from 'redux'
import {Context} from './context'
import {DeviceClassType} from './device-class'
import {InterfaceType} from './interface'
import {pubsub} from './schema'

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

export function papp<A, B, R>(fn: (a: A, b: B) => R, a: A): (b: B) => R {
  return (b: B) => fn(a, b)
}

async function* map<T, U>(fn: (item: T) => U, asyncIterator: AsyncIterator<T>) {
  for await (const item of {[Symbol.asyncIterator]: () => asyncIterator}) {
    yield fn(item)
  }
}
export const mapP = <T, U>(fn: (item: T) => U) => (
  asyncIterator: AsyncIterator<T>,
) => map(fn, asyncIterator)

async function* filter<T>(
  fn: (item: T) => boolean,
  asyncIterator: AsyncIterator<T>,
) {
  for await (const item of {[Symbol.asyncIterator]: () => asyncIterator}) {
    if (fn(item)) {
      yield item
    }
  }
}
export const filterP = <T>(fn: (item: T) => boolean) => (
  asyncIterator: AsyncIterator<T>,
) => filter(fn, asyncIterator)

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

export function statusesForDevice(
  device: Device,
  {
    interfaceIds: specifiedInterfaces,
    statusIds: specifiedStatusIds,
  }: {interfaceIds?: Array<string>; statusIds?: Array<string>},
  {storage}: Context,
) {
  const state = storage.getState()
  const interfaces = specifiedInterfaces || device.interfaceIds
  console.log('interfaces', interfaces)
  return (
    interfaces &&
    flatMap(interfaces, interfaceId => {
      const iface = state.interfaces[interfaceId]
      if (!iface) {
        throw raxaError({type: 'missingInterface', interfaceId})
      }
      if (!iface.status) return []
      const statusIds = specifiedStatusIds || Object.keys(iface.status)
      console.log('statusIds', statusIds)
      return statusIds.map(statusId => ({
        id: `${device.id}:${interfaceId}:${statusId}`,
        interfaceId,
        statusId,
        value: getValue(state.status, [device.id, interfaceId, statusId]),
      }))
    })
  )
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
      resolve({deviceClassId}: Device, {}, {storage}: Context): DeviceClass {
        return storage.getState().deviceClasses[deviceClassId]
      },
    },
    types: {
      type: [GraphQLString],
      validate: joi.object({}),
      resolve(
        {types, deviceClassId}: Device,
        {},
        {storage}: Context,
      ): GraphQlDevice['types'] {
        if (types) return types
        return storage.getState().deviceClasses[deviceClassId].types
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
      resolve(device: Device, {}, {storage}: Context) {
        const state = storage.getState()
        const interfaceIds =
          device.interfaceIds ||
          storage.getState().deviceClasses[device.deviceClassId].interfaceIds
        return interfaceIds.map(iface => state.interfaces[iface])
      },
    },
    status: {
      type: [DeviceStatusType],
      validate: joi.object({
        interfaceIds: joi.array().items(joi.string().required()),
        statusIds: joi.array().items(joi.string().required()),
      }),
      resolve: statusesForDevice,
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
    type: [DeviceStatusType],
    validate: joi.object({
      deviceId: joi.string(),
      interfaceId: joi.string(),
      statusId: joi.string(),
      value: joi.string(),
    }),
    writeRules: false,
    async resolve(
      _,
      modification: Modification,
      context: Context,
    ): Promise<Array<DeviceStatus> | undefined> {
      await context.plugins.setDeviceStatus(modification)
      const device = context.storage.getState().devices[modification.deviceId]
      if (!device.interfaceIds) {
        device.interfaceIds = context.storage.getState().deviceClasses[
          device.deviceClassId
        ].interfaceIds
      }
      return statusesForDevice(device, {}, context)
    },
  },
})

export const deviceSubscriptions = {
  deviceStatusUpdated: {
    type: DeviceStatusType.graphQLType,
    subscribe: (_, __, {storage}: Context) =>
      map((action: typeof actions.statusUpdated) => {
        const status = statusesForDevice(
          {id: action.payload!.deviceId} as any,
          {
            interfaceIds: [action.payload!.interfaceId],
            statusIds: [action.payload!.statusId],
          },
          {storage, plugins: undefined as any},
        )

        return {
          deviceStatusUpdated: status === undefined ? undefined : status[0],
        }
      }, pubsub.asyncIterator(actions.statusUpdated.type!)),
  },
  deviceUpdated: {
    type: DeviceType.graphQLType,
    args: {
      id: {type: GraphQLString},
    },
    subscribe: (_, {id}, {storage}: Context) =>
      compose(
        mapP((action: typeof actions.deviceUpdated) => ({
          deviceUpdated: storage.getState().devices[action.payload!.device.id],
        })),
        filterP(
          (action: typeof actions.deviceUpdated) =>
            id === undefined || action.payload!.device.id === id,
        ),
      )(pubsub.asyncIterator(actions.deviceUpdated.type!)),
  },
}
