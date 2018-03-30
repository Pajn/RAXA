import {Action, createActions as origCreateActions} from 'redux-decorated'
import {Device, DeviceClass, Interface, PluginConfiguration} from './entities'
import {InterfaceState} from './state'

export const createActions = <T extends Record<string, Action<{}>>>(
  actions: T,
  {
    prefix,
  }: {
    prefix?: string
  } = {},
): {
  [K in keyof T]: Pick<T[K], 'payload'> & {
    type: K
  }
} => origCreateActions(actions, {prefix}) as any

export const actions = createActions({
  deviceAdded: {} as Action<{device: Device; interfaces: InterfaceState}>,
  deviceUpdated: {} as Action<{device: Device}>,
  deviceRemoved: {} as Action<{device: Device}>,

  deviceClassAdded: {} as Action<{deviceClass: DeviceClass}>,
  deviceClassUpdated: {} as Action<{deviceClass: DeviceClass}>,
  deviceClassRemoved: {} as Action<{deviceClass: DeviceClass}>,

  interfaceAdded: {} as Action<{iface: Interface}>,
  interfaceUpdated: {} as Action<{iface: Interface}>,
  interfaceRemoved: {} as Action<{iface: Interface}>,

  pluginAdded: {} as Action<{plugin: PluginConfiguration}>,
  pluginUpdated: {} as Action<{plugin: Partial<PluginConfiguration>}>,
  pluginRemoved: {} as Action<{plugin: PluginConfiguration}>,

  statusUpdated: {} as Action<{
    deviceId: string
    interfaceId: string
    statusId: string
    value: any
  }>,
})
