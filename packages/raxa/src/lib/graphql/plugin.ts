import {GraphQLBoolean, GraphQLString} from 'graphql'
import {buildMutations, buildQueries, buildType} from 'graphql-verified'
import * as joi from 'joi'
import {Plugin, actions} from 'raxa-common'
import * as semver from 'semver'
import {Context} from './context'

export const PluginType = buildType<Plugin>({
  name: 'Plugin',
  fields: {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    shortDescription: {type: GraphQLString},
    description: {type: GraphQLString},
    version: {type: GraphQLString},
    availableVersion: {type: GraphQLString},
    enabled: {type: GraphQLBoolean},
    installed: {type: GraphQLBoolean},
    upgradable: {type: GraphQLBoolean},
  } as any,
  readRules: false,
  writeRules: false,
})

export const pluginQueries = buildQueries({
  plugins: {
    type: [PluginType],
    validate: joi.object({
      httpEndpoint: joi.boolean(),
      enabled: joi.boolean(),
    }),
    resolve(_, {enabled, httpEndpoint}, {storage}: Context) {
      let plugins = Object.values(storage.getState().plugins).map(plugin => ({
        ...plugin,
        installed: true,
      }))
      if (enabled !== undefined) {
        plugins = plugins.filter(plugin => plugin.enabled === enabled)
      }
      if (httpEndpoint !== undefined) {
        plugins = plugins.filter(
          plugin =>
            (plugin.httpForwarding && plugin.httpForwarding.showInSettings) ===
            httpEndpoint,
        )
      }
      return plugins.sort((a, b) => a.name.localeCompare(b.name))
    },
  },
  avaliblePlugins: {
    type: [PluginType],
    validate: joi.object({}),
    async resolve(_, __, {pluginManager, storage}: Context) {
      let installedPlugins = storage.getState().plugins
      const plugins = (await pluginManager.listAvaliblePlugins())
        .map(plugin => ({
          ...plugin,
          availableVersion: plugin.version,
          version:
            installedPlugins[plugin.id] && installedPlugins[plugin.id].version,
          installed: installedPlugins[plugin.id],
          upgradable:
            installedPlugins[plugin.id] &&
            ((installedPlugins[plugin.id].version &&
              semver.gt(plugin.version, installedPlugins[plugin.id].version)) ||
              process.env.NODE_ENV === 'development'),
        }))
        .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))
      return plugins
    },
  },
})

export const pluginMutations = buildMutations({
  installPlugin: {
    type: PluginType,
    validate: joi.object({
      pluginId: joi.string().required(),
    }),
    writeRules: false,
    async resolve(
      _,
      {pluginId}: {pluginId: string},
      {pluginManager, storage}: Context,
    ) {
      await pluginManager.installPlugin(pluginId)

      return {...storage.getState().plugins[pluginId], installed: true}
    },
  },
  upgradePlugin: {
    type: PluginType,
    validate: joi.object({
      pluginId: joi.string().required(),
    }),
    writeRules: false,
    async resolve(
      _,
      {pluginId}: {pluginId: string},
      {pluginSupervisor, storage}: Context,
    ) {
      await pluginSupervisor.upgradePlugin(pluginId)

      return {...storage.getState().plugins[pluginId], installed: true}
    },
  },

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
