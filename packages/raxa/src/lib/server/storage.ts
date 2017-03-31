import nedb from 'nedb-persist'
import {Service, actions, defaultInterfaces, DeviceClass, Interface, PluginConfiguration, Device} from 'raxa-common'
import {DeviceState, DeviceClassState, InterfaceState, PluginState, State, StatusState} from 'raxa-common/lib/state'
import {createReducer, updateIn, Action, action} from 'redux-decorated'
import {Store, createStore, combineReducers} from 'redux'
import {persistStore, autoRehydrate} from 'redux-persist'
import {validateDeviceClass, validateInterface, validateDevice} from '../validations'
import {PluginSupervisor} from './plugin-supervisor'

const deviceReducer = createReducer<DeviceState>({})
  .when(actions.deviceAdded, (state, {device}) => ({
    ...state,
    [device.id!]: device,
  }))
  .when(actions.deviceUpdated, (state, {device}) => ({
    ...state,
    [device.id!]: device,
  }))
  .build()

const deviceClassReducer = createReducer<DeviceClassState>({})
  .when(actions.deviceClassAdded, (state, {deviceClass}) => ({
    ...state,
    [deviceClass.id!]: deviceClass,
  }))
  .when(actions.deviceClassUpdated, (state, {deviceClass}) => ({
    ...state,
    [deviceClass.id!]: deviceClass,
  }))
  .build()

const interfaceReducer = createReducer<InterfaceState>(defaultInterfaces)
  .when(actions.interfaceAdded, (state, {iface}) => ({
    ...state,
    [iface.id!]: iface,
  }))
  .when(actions.interfaceUpdated, (state, {iface}) => ({
    ...state,
    [iface.id!]: iface,
  }))
  .build()

const pluginReducer = createReducer<PluginState>({})
  .when(actions.pluginAdded, (state, {plugin}) => ({
    ...state,
    [plugin.id!]: plugin,
  }))
  .when(actions.pluginUpdated, (state, {plugin}) => ({
    ...state,
    [plugin.id!]: plugin,
  }))
  .build()
const statusReducer = createReducer<StatusState>({})
  .when(actions.statusUpdated, (state, {deviceId, interfaceId, statusId, value}) =>
    updateIn([deviceId, interfaceId, statusId] as any, value, state))
  .build()

export class StorageService extends Service {
  private store: Store<State>
  public dispatch: <P>(action: Action<P>, payload: P) => void = (a, payload) => {
    this.store.dispatch(action(a, payload))
  }
  public getState: () => State

  async start() {
    this.store = createStore<State>(
      combineReducers<State>({
        devices: deviceReducer,
        deviceClasses: deviceClassReducer,
        interfaces: interfaceReducer,
        plugins: pluginReducer,
        status: statusReducer,
      }),
      autoRehydrate<State>(),
    )
    this.getState = this.store.getState

    await new Promise(resolve => {
      persistStore(this.store, {storage: nedb({filename: 'db.json'}) as any}, resolve)
    })
  }

  async stop() {
  }

  public installInterface(iface: Interface) {
    this.log.info(`Installing interface ${iface.id}`)
    const state = this.getState()
    validateInterface(iface)
    if (state.interfaces[iface.id]) {
      this.dispatch(actions.interfaceUpdated, {iface})
    } else {
      this.dispatch(actions.interfaceAdded, {iface})
    }
  }

  public installDeviceClass(deviceClass: DeviceClass) {
    this.log.info(`Installing device class ${deviceClass.id}`)
    const state = this.getState()
    validateDeviceClass(state, deviceClass)
    if (state.deviceClasses[deviceClass.id]) {
      this.dispatch(actions.deviceClassUpdated, {deviceClass})
    } else {
      this.dispatch(actions.deviceClassAdded, {deviceClass})
    }
  }

  public installPlugin(plugin: PluginConfiguration) {
    this.log.info(`Installing plugin ${plugin.id}`)
    const state = this.getState()
    if (state.plugins[plugin.id]) {
      this.dispatch(actions.pluginUpdated, {plugin})
    } else {
      this.dispatch(actions.pluginAdded, {plugin})
    }
  }

  public async upsertDevice(device: Device): Promise<Device> {
    const plugins = this.serviceManager.runningServices.PluginSupervisor as PluginSupervisor

    this.log.info(`Upsert device ${device.id}`)
    const state = this.getState()
    device = validateDevice(state, device)

    if (device.id) {
      this.dispatch(actions.deviceUpdated, {device})
    } else {
      device.id = Date.now().toString()

      device = (await plugins.onDeviceCreated(device)) || device

      this.dispatch(actions.deviceAdded, {device})
    }
    return this.getState().devices[device.id]
  }

  public updateDevice(device: Device) {
    this.log.info(`Update device ${device.id}`)
    const state = this.getState()
    if (state.plugins[device.id]) {
      this.dispatch(actions.deviceUpdated, {device})
    }
  }
}
