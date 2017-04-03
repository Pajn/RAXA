import {GraphQLString} from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import {buildQueries, buildType} from 'graphql-verified'
import * as joi from 'joi'
import {DeviceClass} from 'raxa-common'
import {Context} from './context'

export const DeviceClassType = buildType<DeviceClass>({
  name: 'DeviceClass',
  fields: {
    id: {type: GraphQLString},
    name: {
      type: GraphQLString,
      resolve: deviceClass => deviceClass.name || deviceClass.id,
    },
    shortDescription: {type: GraphQLString},
    description: {type: GraphQLString},
    pluginId: {type: GraphQLString},
    config: {type: GraphQLJSON},
    interfaceIds: {type: [GraphQLString]},
    // variables?: {[interfaceId: string]: {[variableName: string]: any}};
  } as any,
  readRules: false,
  writeRules: false,
})

export const deviceClassQueries = buildQueries({
  deviceClasses: {
    type: [DeviceClassType],
    validate: joi.object({}),
    resolve(_, {}, {storage}: Context) {
      return Object.values(storage.getState().deviceClasses)
    },
  },
})
