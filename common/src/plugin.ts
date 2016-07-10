import {Awaitable, Call, Device, Modification, PluginDefinition} from './entities'
import {Service} from './service'

export abstract class Plugin extends Service {
  definition: PluginDefinition

  callDevice: (call: Call) => Promise<void>
  createDevice: (device: Device) => Promise<void>

  /**
   * Called when a device is being created from one of the plugins DeviceClasses
   * Throw to abort the creation, return an updated device to alter its
   * configuration or return undefined to don't do anything at all.
   * If a Promise is returned then RAXA will wait for it to be resolved.
   */
  abstract onDeviceCreated(device: Device): Awaitable<void|Device>

  /**
   * Called when a device owned by the plugin is beeing called.
   * Throw to notify an error, return an updated device to alter its
   * configuration or return undefined to don't do anything at all.
   * If a Promise is returned then RAXA will wait for it to be resolved.
   */
  abstract onDeviceCalled(call: Call, device: Device): Awaitable<void|Device>

  abstract onDeviceStatusModified(modification: Modification, device: Device):
    Awaitable<void|Device>
}
