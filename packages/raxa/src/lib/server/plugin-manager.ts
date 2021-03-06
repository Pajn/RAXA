import execa from 'execa'
import {mkdirp, pathExists, writeFile} from 'fs-extra'
import fetch from 'node-fetch'
import {join} from 'path'
import {Plugin, PluginDefinition, Service, actions} from 'raxa-common/cjs'
import * as semver from 'semver'
import {pluginDir} from '../config'
import {StorageService} from './storage'

const pluginPackageNamePattern = /^raxa-plugin-(.+)$/

export type Package = {
  id: string
  name: string
  description: string
  version: string
  links: {
    npm: string
    homepage: string
    repository: string
    bugs: string
  }
  publisher: {
    username: string
    email: string
  }
}

export class PluginManager extends Service {
  storage: StorageService

  async start() {
    this.storage = (this.serviceManager.runningServices
      .StorageService as any) as StorageService
  }

  protected pluginPath(pluginId: string) {
    return `../../../../plugin-${pluginId}`
  }

  requirePlugin(id: string): new () => Plugin {
    let plugin = require(this.pluginPath(id))
    if (plugin.default) {
      plugin = plugin.default
    }
    return plugin
  }

  async installPlugin(pluginId: string) {
    this.log.info(`Installing plugin ${pluginId}`)

    const pluginPackageJson = require(`${this.pluginPath(
      pluginId,
    )}/package.json`)
    const pluginDefinitionModule = require(`${this.pluginPath(
      pluginId,
    )}/plugin`)
    const pluginDefinition = (pluginDefinitionModule.default ||
      pluginDefinitionModule) as PluginDefinition
    let plugin = require(this.pluginPath(pluginId))
    if (plugin.default) {
      plugin = plugin.default
    }
    if (pluginDefinition.interfaces === undefined) {
      pluginDefinition.interfaces = {}
    }
    if (pluginDefinition.deviceClasses === undefined) {
      pluginDefinition.deviceClasses = {}
    }

    if (!semver.valid(pluginPackageJson.version)) {
      throw Error(`Plugin ${pluginId} has no valid semver version`)
    }

    if (typeof plugin !== 'function') {
      throw Error(`Plugin ${pluginId} has no default exported class`)
    }

    if (pluginId !== pluginDefinition.id)
      throw Error(`Invalid plugin id ${pluginId} !== ${pluginDefinition.id}`)

    Object.entries(pluginDefinition.interfaces).forEach(([ifaceId, iface]) => {
      if (ifaceId !== iface.id)
        throw Error(`Invalid interface id ${ifaceId} !== ${iface.id}`)
      iface.pluginId = pluginId
    })

    Object.entries(pluginDefinition.deviceClasses).forEach(
      ([id, deviceClass]) => {
        if (id !== deviceClass.id)
          throw Error(`Invalid device class id ${id} !== ${deviceClass.id}`)
        deviceClass.pluginId = pluginId
      },
    )

    Object.values(pluginDefinition.interfaces).forEach(iface => {
      this.storage.installInterface(iface)
    })

    Object.values(pluginDefinition.deviceClasses).forEach(deviceClass => {
      this.storage.installDeviceClass(deviceClass)
    })

    this.storage.installPlugin({
      ...pluginDefinition,
      id: pluginId,
      enabled: false,
      version: pluginPackageJson.version,
    })
  }

  async upgradePlugin(id: string) {
    this.log.info(`Upgrading plugin ${id}`)

    const pluginPackageJson = require(`${this.pluginPath(id)}/package.json`)
    const pluginDefinitionModule = require(`${this.pluginPath(id)}/plugin`)
    const pluginDefinition = (pluginDefinitionModule.default ||
      pluginDefinitionModule) as PluginDefinition
    let plugin = require(this.pluginPath(id))
    if (plugin.default) {
      plugin = plugin.default
    }
    if (pluginDefinition.interfaces === undefined) {
      pluginDefinition.interfaces = {}
    }
    if (pluginDefinition.deviceClasses === undefined) {
      pluginDefinition.deviceClasses = {}
    }

    if (!semver.valid(pluginPackageJson.version)) {
      throw Error(`Plugin ${id} has no valid semver version`)
    }

    if (typeof plugin !== 'function') {
      throw Error(`Plugin ${id} has no default exported class`)
    }

    if (id !== pluginDefinition.id)
      throw Error(`Invalid plugin id ${id} !== ${pluginDefinition.id}`)

    Object.entries(pluginDefinition.interfaces).forEach(([id, iface]) => {
      if (id !== iface.id)
        throw Error(`Invalid interface id ${id} !== ${iface.id}`)
      iface.pluginId = id
    })

    Object.entries(pluginDefinition.deviceClasses).forEach(
      ([id, deviceClass]) => {
        if (id !== deviceClass.id)
          throw Error(`Invalid device class id ${id} !== ${deviceClass.id}`)
        deviceClass.pluginId = pluginDefinition.id
      },
    )

    Object.values(pluginDefinition.interfaces).forEach(iface => {
      this.storage.installInterface(iface)
    })

    Object.values(pluginDefinition.deviceClasses).forEach(deviceClass => {
      this.storage.installDeviceClass(deviceClass)
    })

    this.storage.dispatch(actions.pluginUpdated, {
      plugin: {
        ...pluginDefinition,
        id,
        version: pluginPackageJson.version,
      },
    })
  }

  async listAvaliblePlugins() {
    const response = await fetch(
      'https://registry.npmjs.org/-/v1/search?text=keywords:raxa-plugin',
    )
    if (response.status >= 400) {
      this.log.error(await response.text())
      throw Error('Could not fetch package list')
    }
    const packages: Array<Package> = (await Promise.all(
      ((await response.json()) as {
        objects: Array<{
          package: Pick<Package, Exclude<keyof Package, 'id'>>
        }>
      }).objects
        .filter(hit => pluginPackageNamePattern.test(hit.package.name))
        .map(hit =>
          fetch(`https://registry.npmjs.org/${hit.package.name}/latest`),
        )
        .map(response => response.then(response => response.json())),
    ))
      .filter(hit => pluginPackageNamePattern.test(hit.name))
      .map(({name, displayName, ...hit}) => {
        const [, id] = pluginPackageNamePattern.exec(name)!

        return {...hit, id, name: displayName}
      })
    return packages
  }
}

export class ProductionPluginManager extends PluginManager {
  static serviceName = 'PluginManager'

  async start() {
    await super.start()

    await mkdirp(pluginDir)
    const packageJson = join(pluginDir, 'package.json')
    if (!(await pathExists(packageJson))) {
      this.log.info(`Plugin package.json missing, creating`)
      await writeFile(
        packageJson,
        JSON.stringify({
          name: 'raxa-plugin-dir',
          description: 'Installation location of plugins',
          version: '0.1.0',
          dependencies: {},
        }),
      )
    }
  }

  protected pluginPath(pluginId: string) {
    return join(pluginDir, 'node_modules', `raxa-plugin-${pluginId}`)
  }

  async installPlugin(id: string) {
    this.log.debug(`Running yarn add raxa-plugin-${id} --prod`)
    await execa('yarn', ['add', `raxa-plugin-${id}`, '--prod'], {
      cwd: pluginDir,
      stdio: ['ignore', process.stdout, process.stderr],
    })
    this.log.debug(`yarn finished`)

    await super.installPlugin(id)
  }

  async upgradePlugin(id: string) {
    this.log.debug(`Running yarn upgrade --latest raxa-plugin-${id}`)
    try {
      await execa('yarn', ['upgrade', '--latest', `raxa-plugin-${id}`], {
        cwd: pluginDir,
        stdio: ['ignore', process.stdout, process.stderr],
      })
      this.log.debug(`yarn finished`)
    } catch (e) {
      this.log.error(`Error upgrading plugin ${id}`, e)
      throw e
    }
    Object.keys(require.cache)
      .filter(path => path.startsWith(require.resolve(this.pluginPath(id))))
      .forEach(path => {
        delete require.cache[path]
      })
    await super.upgradePlugin(id)
  }
}
