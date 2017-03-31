import {GraphQLString} from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import {buildQueries, buildMutations, buildType} from 'graphql-verified'
import * as joi from 'joi'
import {Device, Call} from 'raxa-common'
import {Context} from './context'
import {Modification} from '../../../../common/lib/entities'

export const DeviceType = buildType<Device>({
  name: 'Device',
  fields: {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    pluginId: {type: GraphQLString},
    deviceClassId: {type: GraphQLString},
    config: {type: GraphQLJSON},
    interfaces: {type: [GraphQLString]},
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
