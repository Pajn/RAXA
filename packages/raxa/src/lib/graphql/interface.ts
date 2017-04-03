import {GraphQLString} from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import {buildQueries, buildType} from 'graphql-verified'
import * as joi from 'joi'
import {Interface} from 'raxa-common'
import {Context} from './context'

export const InterfaceType = buildType<Interface>({
  name: 'Interface',
  fields: {
    id: {type: GraphQLString},
    name: {
      type: GraphQLString,
      resolve: iface => iface.name || iface.id,
    },
    shortDescription: {type: GraphQLString},
    description: {type: GraphQLString},
    pluginId: {type: GraphQLString},
    methods: {type: GraphQLJSON},
    status: {type: GraphQLJSON},
    // variables?: {[variable: string]: {}}
  } as any,
  readRules: false,
  writeRules: false,
})

export const interfaceQueries = buildQueries({
  interface: {
    type: InterfaceType,
    validate: joi.object({
      id: joi.string().required(),
    }),
    resolve(_, {id}, {storage}: Context) {
      return storage.getState().interfaces[id]
    },
  },
  interfaces: {
    type: [InterfaceType],
    validate: joi.object({}),
    resolve(_, {}, {storage}: Context) {
      return Object.values(storage.getState().interfaces)
    },
  },
})
