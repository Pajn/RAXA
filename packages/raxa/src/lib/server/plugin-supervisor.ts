import {EventEmitter} from 'events'
import execa from 'execa'
import {mkdirp} from 'fs-extra'
import {join} from 'path'
import {
  Awaitable,
  Call,
  Device,
  Modification,
  Plugin,
  PluginDefinition,
  Service,
  ServiceManager,
  raxaError,
} from 'raxa-common/cjs'
import {ServiceImplementation} from 'raxa-common/cjs/service'
import {validateAction} from 'raxa-common/cjs/validations'
import {pluginDir, production} from '../config'
import {StorageService} from './storage'

class PluginManager extends ServiceManager {
  supervisor: PluginSupervisor
  eventEmitter = new EventEmitter()

  configureService(service: ServiceImplementation, plugin: Plugin) {
    super.configureService(service, plugin)
    plugin.upsertDevice = (device: Device) => {
      const storage = (this.supervisor.serviceManager.runningServices
        .StorageService as any) as StorageService
      return storage.upsertDevice(device)
    }
    plugin.setDeviceStatus = (modification: Modification) =>
      this.supervisor.setDeviceStatus(modification)
    plugin.callDevice = (call: Call) => this.supervisor.callDevice(call)

    plugin.fireEvent = async (interfaceId, eventId, data) => {
      this.eventEmitter.emit('event', {interfaceId, eventId, data})
    }

    plugin.listenOn = (interfaceId, eventId, callback) => {
      this.eventEmitter.on('event', event => {
        if (event.interfaceId === interfaceId && event.eventId === eventId) {
          callback(event.data)
        }
      })
    }
  }
}

function pluginPath(pluginId: string) {
  return `raxa-plugin-${pluginId}`
  // return production
  //   ? join(pluginDir, pluginId, 'node_modules', `raxa-plugin-${pluginId}`)
  //   : `raxa-plugin-${pluginId}`
}

export class PluginSupervisor extends Service {
  private runningPlugins: {[name: string]: Plugin} = {}
  private pluginServiceManager: PluginManager

  async start() {
    this.pluginServiceManager = new PluginManager(this.log)
    this.pluginServiceManager.supervisor = this
    this.pluginServiceManager.runningServices.StorageService = this.serviceManager.runningServices.StorageService

    const storage = (this.serviceManager.runningServices
      .StorageService as any) as StorageService
    await Promise.all(
      [
        'scenery',
        'ledstrip',
        'nexa',
        'raxa-tellsticknet',
        'timer',
        'trigger',
        'sunricher',
      ]
        // .filter(plugin => !storage.getState().plugins[plugin])
        .map(plugin => this.installPlugin(plugin)),
    )

    await Promise.all(
      Object.values(storage.getState().plugins)
        .filter(plugin => plugin.enabled)
        .map(plugin => this.startPlugin(plugin.id)),
    )
  }

  async stop() {
    for (const plugin of Object.values(this.runningPlugins)) {
      await plugin.stop()
    }
  }

  private async installPlugin(id: string) {
    const storage = (this.serviceManager.runningServices
      .StorageService as any) as StorageService

    this.log.info(`Installing plugin ${id}`)

    if (production) {
      // const dir = join(pluginDir, id)
      // await mkdirp(dir)
      // await execa('yarn', ['init', '--yes'], {cwd: dir})
      // await execa('yarn', ['add', `raxa-plugin-${id}`], {cwd: dir})
    }

    const pluginDefinitionModule = require(`${pluginPath(id)}/plugin`)
    const pluginDefinition = (pluginDefinitionModule.default ||
      pluginDefinitionModule) as PluginDefinition
    let plugin = require(pluginPath(id))
    if (plugin.default) {
      plugin = plugin.default
    }

    if (typeof plugin !== 'function') {
      this.log.warn(`Plugin ${id} has no default exported class`)
      return
    }

    if (id !== pluginDefinition.id)
      throw new Error(`Invalid plugin id ${id} !== ${pluginDefinition.id}`)

    Object.entries(pluginDefinition.interfaces || {}).forEach(([id, iface]) => {
      if (id !== iface.id)
        throw new Error(`Invalid interface id ${id} !== ${iface.id}`)
      iface.pluginId = id
      storage.installInterface(iface)
    })

    Object.entries(
      pluginDefinition.deviceClasses,
    ).forEach(([id, deviceClass]) => {
      if (id !== deviceClass.id)
        throw new Error(`Invalid device class id ${id} !== ${deviceClass.id}`)
      deviceClass.pluginId = pluginDefinition.id
      storage.installDeviceClass(deviceClass)
    })

    storage.installPlugin({...pluginDefinition, id, enabled: true})
  }

  private async startPlugin(id: string) {
    this.log.info(`Starting plugin ${id}`)
    let plugin = require(pluginPath(id))
    if (plugin.default) {
      plugin = plugin.default
    }

    const pluginInstance = await this.pluginServiceManager.startService(plugin)
    this.runningPlugins[id] = pluginInstance as Plugin
  }

  private getPlugin(id: string) {
    const plugin = this.runningPlugins[id]
    if (!plugin) {
      throw raxaError({type: 'pluginNotEnabled', pluginId: id})
    }
    return plugin
  }

  public onDeviceCreated(device: Device): Awaitable<void | Device> {
    return this.getPlugin(device.pluginId).onDeviceCreated(device)
  }
  public onDeviceUpdated(device: Device): Awaitable<void | Device> {
    return this.getPlugin(device.pluginId).onDeviceUpdated(device)
  }
  public onDeviceCalled(call: Call, device: Device): Awaitable<void | Device> {
    return this.getPlugin(device.pluginId).onDeviceCalled(call, device)
  }
  public onDeviceStatusModified(
    modification: Modification,
    device: Device,
  ): Awaitable<void | Device> {
    return this.getPlugin(device.pluginId).onDeviceStatusModified(
      modification,
      device,
    )
  }

  public async setDeviceStatus(modification: Modification) {
    const storage = (this.serviceManager.runningServices
      .StorageService as any) as StorageService
    const state = storage.getState()
    validateAction(state, modification)
    const device = state.devices[modification.deviceId]
    const iface = state.interfaces[modification.interfaceId]
    if (!iface.status || !iface.status[modification.statusId]) {
      throw raxaError({
        type: 'missingStatus',
        interfaceId: modification.interfaceId,
        statusId: modification.statusId,
      })
    }
    // todo: validate status value
    if (modification.value === 'false') {
      modification.value = false
    }
    const updatedDevice = await this.getPlugin(
      device.pluginId,
    ).onDeviceStatusModified(modification, device)
    if (updatedDevice) {
      storage.updateDevice(device)
    }
  }

  public async callDevice(call: Call) {
    const storage = (this.serviceManager.runningServices
      .StorageService as any) as StorageService
    const state = storage.getState()
    validateAction(state, call)
    const device = state.devices[call.deviceId]
    const iface = state.interfaces[call.interfaceId]
    if (!iface.methods || !iface.methods[call.method]) {
      throw raxaError({
        type: 'missingMethod',
        interfaceId: call.interfaceId,
        method: call.method,
      })
    }
    // todo: validate arguments
    const updatedDevice = await this.getPlugin(device.pluginId).onDeviceCalled(
      call,
      device,
    )
    if (updatedDevice) {
      storage.updateDevice(device)
    }
  }
}
