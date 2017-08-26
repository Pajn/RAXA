import {GraphQLBoolean, GraphQLString} from 'graphql'
import {buildMutations, buildQueries, buildType} from 'graphql-verified'
import * as joi from 'joi'
import {Plugin, actions} from 'raxa-common'
import {Context} from './context'

export const PluginType = buildType<Plugin>({
  name: 'Plugin',
  fields: {
    id: {type: GraphQLString},
    name: {
      type: GraphQLString,
      resolve: plugin => plugin.name || plugin.id,
    },
    shortDescription: {type: GraphQLString},
    description: {type: GraphQLString},
    enabled: {type: GraphQLBoolean},
  } as any,
  readRules: false,
  writeRules: false,
})

export const pluginQueries = buildQueries({
  plugins: {
    type: [PluginType],
    validate: joi.object({
      enabled: joi.boolean(),
    }),
    resolve(_, {enabled}, {storage}: Context) {
      let plugins = Object.values(storage.getState().plugins)
      if (enabled !== undefined) {
        plugins = plugins.filter(plugin => plugin.enabled === enabled)
      }
      return plugins.sort((a, b) => a.name.localeCompare(b.name))
    },
  },
})

export const pluginMutations = buildMutations({
  setPluginEnabled: {
    type: PluginType,
    validate: joi.object({
      pluginId: joi.string().required(),
      enabled: joi.boolean().required(),
    }),
    writeRules: false,
    async resolve(
      _,
      {pluginId, enabled}: {pluginId: string; enabled: boolean},
      {storage}: Context,
    ) {
      storage.dispatch(actions.pluginUpdated, {plugin: {id: pluginId, enabled}})
      return storage.getState().plugins[pluginId]
    },
  },
})
