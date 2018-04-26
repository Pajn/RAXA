import {EventEmitter} from 'events'
import {
  Awaitable,
  Call,
  Device,
  Modification,
  Plugin,
  Service,
  ServiceManager,
  actions,
  raxaError,
} from 'raxa-common/cjs'
import {Actions} from 'raxa-common/cjs/plugin'
import {ServiceImplementation} from 'raxa-common/cjs/service'
import {validateAction} from 'raxa-common/cjs/validations'
import {sslCert, sslKey} from '../config'
import {pubsub} from '../graphql/schema'
import {PluginManager} from './plugin-manager'
import {StorageService} from './storage'

class PluginServiceManager extends ServiceManager {
  supervisor: PluginSupervisor
  eventEmitter = new EventEmitter()

  configureService(service: ServiceImplementation, plugin: Plugin) {
    super.configureService(service, plugin)

    plugin.config = {sslCert, sslKey}

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

export class PluginSupervisor extends Service {
  private runningPlugins: {[name: string]: Plugin} = {}
  private pluginServiceManager: PluginServiceManager
  private subscriptions: Array<number> = []

  async start() {
    const storage = this.serviceManager.runningServices
      .StorageService as StorageService

    this.pluginServiceManager = new PluginServiceManager(this.log)
    this.pluginServiceManager.supervisor = this
    this.pluginServiceManager.runningServices.StorageService = storage

    await Promise.all(
      Object.values(storage.getState().plugins)
        .filter(plugin => plugin.enabled)
        .map(plugin => this.startPlugin(plugin.id)),
    )

    pubsub
      .subscribe(
        actions.pluginUpdated.type!,
        ({payload}: typeof actions.pluginUpdated) => {
          const plugin = storage.getState().plugins[payload!.plugin.id!]

          if (plugin.enabled && !this.runningPlugins[plugin.id]) {
            this.startPlugin(plugin.id)
          } else if (!plugin.enabled && this.runningPlugins[plugin.id]) {
            this.stopPlugin(plugin.id)
          }
        },
      )
      .then(id => this.subscriptions.push(id))

    pubsub
      .subscribe('action', (action: Actions) => {
        for (const plugin of Object.values(this.runningPlugins)) {
          if (plugin.onAction !== undefined) {
            plugin.onAction(action)
          }
        }
      })
      .then(id => this.subscriptions.push(id))
  }

  async stop() {
    for (const pluginId of Object.keys(this.runningPlugins)) {
      await this.stopPlugin(pluginId)
    }

    for (const subId of this.subscriptions) {
      await pubsub.unsubscribe(subId)
    }
  }

  public async upgradePlugin(id: string) {
    const pluginManager = this.serviceManager.runningServices
      .PluginManager as PluginManager

    const isRunning = this.isRunning(id)
    if (isRunning) {
      await this.stopPlugin(id)
    }
    await pluginManager.upgradePlugin(id)
  }

  private async startPlugin(id: string) {
    const pluginManager = (this.serviceManager.runningServices
      .PluginManager as any) as PluginManager

    this.log.info(`Starting plugin ${id}`)

    try {
      let plugin = pluginManager.requirePlugin(id)
      const pluginInstance = await this.pluginServiceManager.startService(
        plugin,
      )
      this.runningPlugins[id] = pluginInstance as Plugin
    } catch (e) {
      this.log.error(`Error starting plugin ${id}`, e)
    }
  }

  private async stopPlugin(id: string) {
    this.log.info(`Stopping plugin ${id}`)
    const plugin = this.runningPlugins[id]
    try {
      await plugin.stop()
    } catch (e) {
      this.log.error(`Error stopping plugin ${id}`, e)
      throw e
    }
    delete this.runningPlugins[id]
  }

  private getPlugin(id: string) {
    const plugin = this.runningPlugins[id]
    if (!plugin) {
      throw raxaError({type: 'pluginNotEnabled', pluginId: id})
    }
    return plugin
  }

  public isRunning(id: string) {
    return this.runningPlugins[id] !== undefined
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
    this.log.debug('setDeviceStatus', {
      modification,
      deviceName: device.name,
      pluginId: device.pluginId,
    })
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
    this.log.debug('callDevice', {
      call,
      deviceName: device.name,
      pluginId: device.pluginId,
    })
    const updatedDevice = await this.getPlugin(device.pluginId).onDeviceCalled(
      call,
      device,
    )
    if (updatedDevice) {
      storage.updateDevice(device)
    }
  }
}
