import nedb from 'nedb-persist'
import {
  Device,
  DeviceClass,
  Interface,
  PluginConfiguration,
  Service,
  actions,
  defaultInterfaces,
} from 'raxa-common/cjs'
import {
  DeviceClassState,
  DeviceState,
  InterfaceState,
  PluginState,
  State,
  StatusState,
} from 'raxa-common/cjs/state'
import {
  validateDevice,
  validateDeviceClass,
  validateInterface,
} from 'raxa-common/cjs/validations'
import {
  Store,
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
} from 'redux'
import {Action, action, createReducer, updateIn} from 'redux-decorated'
import {autoRehydrate, persistStore} from 'redux-persist'
import {PluginSupervisor} from './plugin-supervisor'

const deviceReducer = createReducer<DeviceState>({})
  .when(actions.deviceAdded, (state, {device}) => ({
    ...state,
    [device.id!]: device,
  }))
  .when(actions.deviceUpdated, (state, {device}) => ({
    ...state,
    [device.id!]: {
      ...state[device.id!],
      name: device.name,
      config: Object.assign({}, state[device.id!].config, device.config),
    },
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
  .when(
    actions.statusUpdated,
    (state, {deviceId, interfaceId, statusId, value}) =>
      updateIn([deviceId, interfaceId, statusId] as any, value, state),
  )
  .build()

export class StorageService extends Service {
  private store: Store<State>
  public dispatch: <P>(action: Action<P>, payload: P) => void = (
    a,
    payload,
  ) => {
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
      compose(
        autoRehydrate<State>(),
        applyMiddleware(_ => next => action => {
          this.log.debug(action)
          return next(action)
        }),
      ),
    )
    this.getState = this.store.getState

    await new Promise(resolve => {
      persistStore(
        this.store,
        {storage: nedb({filename: 'db.json'}) as any},
        resolve,
      )
    })
  }

  async stop() {}

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

  public installDeviceClass(
    deviceClass: DeviceClass & {allowManualCreation?: boolean},
  ) {
    this.log.info(`Installing device class ${deviceClass.id}`)
    const state = this.getState()
    if (deviceClass.allowManualCreation === undefined) {
      deviceClass = {...deviceClass, allowManualCreation: false}
    }
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
    const plugins = (this.serviceManager.runningServices
      .PluginSupervisor as any) as PluginSupervisor

    if (device.id) {
      this.log.info(`Update device ${device.name} (${device.id})`)
    } else {
      this.log.info(`Create device ${device.name}`)
    }
    const state = this.getState()

    if (device.id) {
      const oldDevice = state.devices[device.id]
      Object.assign(device, {
        pluginId: oldDevice.pluginId,
        deviceClassId: oldDevice.deviceClassId,
        interfaceIds: oldDevice.interfaceIds,
      })
    }

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