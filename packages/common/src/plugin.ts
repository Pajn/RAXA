/* tslint:disable:no-empty */
import {actions} from '.'
import {Awaitable, Call, Device, Modification} from './entities'
import {Service} from './service'

export type Actions = (typeof actions)[keyof typeof actions]

export abstract class Plugin extends Service {
  config: {sslCert?: string; sslKey?: string}

  fireEvent: (interfaceId: string, eventId: string, data?: any) => Promise<void>
  listenOn: (
    interfaceId: string,
    eventId: string,
    callback: (data?: any) => any,
  ) => void
  setDeviceStatus: (modification: Modification) => Promise<void>
  callDevice: (call: Call) => Promise<void>
  upsertDevice: (device: Device) => Promise<Device>

  onAction(_action: Actions): void {}

  /**
   * Called when a device is being created from one of the plugins DeviceClasses
   * Throw to abort the creation, return an updated device to alter its
   * configuration or return undefined to don't do anything at all.
   * If a Promise is returned then RAXA will wait for it to be resolved.
   */
  onDeviceCreated(_device: Device): Awaitable<void | Device> {}

  /**
   * Called when a device owned by the plugin is being updated
   * Throw to abort the update, return an updated device to alter its
   * configuration or return undefined to don't do anything at all.
   * If a Promise is returned then RAXA will wait for it to be resolved.
   */
  onDeviceUpdated(_device: Device): Awaitable<void | Device> {}

  /**
   * Called when a device owned by the plugin is being removed.
   */
  onDeviceRemoved(_device: Device): Awaitable<void> {}

  /**
   * Called when a device owned by the plugin is beeing called.
   * Throw to notify an error, return an updated device to alter its
   * configuration or return undefined to don't do anything at all.
   * If a Promise is returned then RAXA will wait for it to be resolved.
   */
  onDeviceCalled(_call: Call, _device: Device): Awaitable<void | Device> {}

  onDeviceStatusModified(
    _modification: Modification,
    _device: Device,
  ): Awaitable<void | Device> {}
}
