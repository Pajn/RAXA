import execa from 'execa'
import {mkdirp, pathExists, writeFile} from 'fs-extra'
import fetch from 'node-fetch'
import {join} from 'path'
import {PluginDefinition, Service, actions} from 'raxa-common/cjs'
import {Omit} from 'react-router'
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

  requirePlugin(id: string) {
    let plugin = require(this.pluginPath(id))
    if (plugin.default) {
      plugin = plugin.default
    }
    return plugin
  }

  async installPlugin(id: string) {
    this.log.info(`Installing plugin ${id}`)

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

    this.storage.installPlugin({
      ...pluginDefinition,
      id,
      enabled: false,
      version: pluginPackageJson.version,
    })
  }

  async upgradePlugin(id: string) {
    this.log.info(`Upgrading plugin ${id}`)

    const pluginPackageJson = require(`${this.pluginPath(id)}/package.json`)

    if (!semver.valid(pluginPackageJson.version)) {
      throw Error(`Plugin ${id} has no valid semver version`)
    }

    this.storage.dispatch(actions.pluginUpdated, {
      plugin: {id, version: pluginPackageJson.version},
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
    const packages = ((await response.json()) as {
      objects: Array<{
        package: Omit<Package, 'id'>
      }>
    }).objects
      .filter(hit => pluginPackageNamePattern.test(hit.package.name))
      .map(hit => {
        const [, id] = pluginPackageNamePattern.exec(hit.package.name)!

        return {...hit.package, id}
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
    if (!await pathExists(packageJson)) {
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
    })

    await super.installPlugin(id)
  }

  async upgradePlugin(id: string) {
    this.log.debug(`Running yarn upgrade --latest raxa-plugin-${id}`)
    await execa('yarn', ['upgrade', '--latest', `raxa-plugin-${id}`], {
      cwd: pluginDir,
    })
    delete require.cache[require.resolve(this.pluginPath(id))]
    delete require.cache[
      require.resolve(require(`${this.pluginPath(id)}/package.json`))
    ]
    await super.upgradePlugin(id)
  }
}
