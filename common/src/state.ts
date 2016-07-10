import {Device, DeviceClass, Interface, PluginConfiguration} from './entities'

export type DeviceState = {[id: number]: Device}
export type DeviceClassState = {[id: string]: DeviceClass}
export type InterfaceState = {[id: string]: Interface}
export type PluginState = {[id: string]: PluginConfiguration}
export type StatusState = {
  [deviceId: number]: {
    [interfaceId: string]: {
      [status: string]: any
    }
  }
}

export type State = {
  devices: DeviceState,
  deviceClasses: DeviceClassState,
  interfaces: InterfaceState,
  plugins: PluginState,
  status: StatusState,
}
