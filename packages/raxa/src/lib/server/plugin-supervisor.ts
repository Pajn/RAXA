import {Awaitable, Call, Device, Modification, Plugin, PluginDefinition, Service, ServiceManager, raxaError} from 'raxa-common'
import {ServiceImplementation} from 'raxa-common/lib/service'
import {validateAction} from 'raxa-common/lib/validations'
import {StorageService} from './storage'

class PluginManager extends ServiceManager {
  supervisor: PluginSupervisor

  configureService(service: ServiceImplementation, plugin: Plugin) {
    super.configureService(service, plugin)
    plugin.upsertDevice = (device: Device) => {
      const storage = this.supervisor.serviceManager.runningServices.StorageService as StorageService
      return storage.upsertDevice(device)
    }
    plugin.setDeviceStatus = (modification: Modification) => this.supervisor.setDeviceStatus(modification)
    plugin.callDevice = (call: Call) => this.supervisor.callDevice(call)
  }
}

export class PluginSupervisor extends Service {
  private runningPlugins: {[name: string]: Plugin} = {}
  private pluginServiceManager: PluginManager

  async start() {
    this.pluginServiceManager = new PluginManager(this.log)
    this.pluginServiceManager.supervisor = this
    this.pluginServiceManager.runningServices.StorageService =
      this.serviceManager.runningServices.StorageService

    const storage = this.serviceManager.runningServices.StorageService as StorageService
    await Promise.all(
      ['mysensors']
        // .filter(plugin => !storage.getState().plugins[plugin])
        .map(plugin => this.installPlugin(plugin))
    )

    await Promise.all(
      Object.values(storage.getState().plugins)
        .filter(plugin => plugin.enabled)
        .map(plugin => this.startPlugin(plugin.id))
    )
  }

  async stop() {
    for (const plugin of Object.values(this.runningPlugins)) {
      await plugin.stop()
    }
  }

  private async installPlugin(name: string) {
    const storage = this.serviceManager.runningServices.StorageService as StorageService

    this.log.info(`Installing plugin ${name}`)
    const pluginDefinition = require(`raxa-plugin-${name}/plugin.json`) as PluginDefinition
    let plugin = require(`raxa-plugin-${name}`)
    if (plugin.default) {
      plugin = plugin.default
    }

    if (typeof plugin !== 'function') {
      this.log.warn(`Plugin ${name} has no default exported class`)
      return
    }

    Object.entries(pluginDefinition.interfaces).forEach(([id, iface]) => {
      if (id !== iface.id) throw new Error(`Invalid interface id ${id} !== ${iface.id}`)
      iface.pluginId = name
      storage.installInterface(iface)
    })

    Object.entries(pluginDefinition.deviceClasses).forEach(([id, deviceClass]) => {
      if (id !== deviceClass.id) throw new Error(`Invalid device class id ${id} !== ${deviceClass.id}`)
      deviceClass.pluginId = name
      storage.installDeviceClass(deviceClass)
    })

    storage.installPlugin({id: name, enabled: true})
  }

  private async startPlugin(name: string) {
    this.log.info(`Starting plugin ${name}`)
    let plugin = require(`raxa-plugin-${name}`)
    if (plugin.default) {
      plugin = plugin.default
    }

    const pluginInstance = await this.pluginServiceManager.startService(plugin)
    this.runningPlugins[name] = pluginInstance as Plugin
  }

  private getPlugin(id: string) {
    const plugin = this.runningPlugins[id]
    if (!plugin) {
      throw raxaError({type: 'pluginNotEnabled', pluginId: id})
    }
    return plugin
  }

  public onDeviceCreated(device: Device): Awaitable<void|Device> {
    return this.getPlugin(device.pluginId).onDeviceCreated(device)
  }
  public onDeviceCalled(call: Call, device: Device): Awaitable<void|Device> {
    return this.getPlugin(device.pluginId).onDeviceCalled(call, device)
  }
  public onDeviceStatusModified(modification: Modification, device: Device): Awaitable<void|Device> {
    return this.getPlugin(device.pluginId).onDeviceStatusModified(modification, device)
  }

  public async setDeviceStatus(modification: Modification) {
    const storage = this.serviceManager.runningServices.StorageService as StorageService
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
    const updatedDevice = await this.getPlugin(device.pluginId)
      .onDeviceStatusModified(modification, device)
    if (updatedDevice) {
      storage.updateDevice(device)
    }
  }

  public async callDevice(call: Call) {
    const storage = this.serviceManager.runningServices.StorageService as StorageService
    const state = storage.getState()
    validateAction(state, call)
    const device = state.devices[call.deviceId]
    const iface = state.interfaces[call.interfaceId]
    if (!iface.methods || !iface.methods[call.method]) {
      throw raxaError({type: 'missingMethod', interfaceId: call.interfaceId, method: call.method})
    }
    // todo: validate arguments
    const updatedDevice = await this.getPlugin(device.pluginId).onDeviceCalled(call, device)
    if (updatedDevice) {
      storage.updateDevice(device)
    }
  }
}
