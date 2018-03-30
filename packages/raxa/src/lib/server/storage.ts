import Datastore from 'nedb'
import nedb from 'nedb-persist'
import {join} from 'path'
import {Modification, Property} from 'raxa-common'
import {
  Device,
  DeviceClass,
  Interface,
  ObjectProperty,
  PluginConfiguration,
  Service,
  actions,
} from 'raxa-common/cjs'
import {DeviceIsInUseError} from 'raxa-common/cjs/errors'
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
import {
  Action,
  action,
  createReducer,
  removeIn,
  updateIn,
} from 'redux-decorated'
import {autoRehydrate, persistStore} from 'redux-persist'
import {dataDir} from '../config'
import {pubsub} from '../graphql/schema'
import {PluginSupervisor} from './plugin-supervisor'

type Result<T, E> = {type: 'ok'; value: T} | {type: 'err'; value: E}
namespace Result {
  export function ok<T>(value: T): Result<T, never> {
    return {type: 'ok', value}
  }
  export function err<E>(err: E): Result<never, E> {
    return {type: 'err', value: err}
  }
}

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
  .when(actions.deviceRemoved, (state, {device}) => removeIn(device.id, state))
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

const interfaceReducer = createReducer<InterfaceState>({})
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
    [plugin.id!]: {...state[plugin.id!], ...plugin},
  }))
  .build()
const statusReducer = createReducer<StatusState>({})
  .when(
    actions.statusUpdated,
    (state, {deviceId, interfaceId, statusId, value}) =>
      updateIn([deviceId, interfaceId, statusId] as any, value, state),
  )
  .when(actions.deviceRemoved, (state, {device}) => removeIn(device.id, state))
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
          const result = next(action)
          if (typeof action.type === 'string') {
            try {
              pubsub.publish(action.type, action)
              pubsub.publish('action', action)
            } catch (e) {
              this.log.error('Pubsub error', e)
            }
          }
          this.log.debug(action)
          return result
        }),
      ),
    )
    this.getState = this.store.getState

    await new Promise(resolve => {
      const db = new Datastore({
        filename: join(dataDir, 'db.json'),
        autoload: true,
      })
      db.persistence.setAutocompactionInterval(1000 * 60 * 10)
      persistStore(this.store, {storage: nedb(db)}, resolve)
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

  public installPlugin(
    plugin: Pick<
      PluginConfiguration,
      Exclude<keyof PluginConfiguration, 'settings'>
    >,
  ) {
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
      device = (await plugins.onDeviceUpdated(device)) || device

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

  public removeDevice(deviceId: string): Result<void, DeviceIsInUseError> {
    const {devices, deviceClasses} = this.getState()
    const deviceToRemove = devices[deviceId]
    const usedInDevices = Object.values(devices).filter(device => {
      if (device.id === deviceToRemove.id) return false

      if (!device.config) return false
      const deviceClass = deviceClasses[device.deviceClassId]
      if (!deviceClass.config) return false

      return configHasDevice(deviceToRemove.id, device.config, {
        type: 'object',
        properties: deviceClass.config,
      } as ObjectProperty<any>)
    })

    if (usedInDevices.length > 0) {
      return Result.err({
        type: 'deviceIsInUse' as 'deviceIsInUse',
        devices: usedInDevices,
      })
    }

    this.dispatch(actions.deviceRemoved, {device: deviceToRemove})
    return Result.ok(undefined)
  }
}

function configHasDevice(deviceId: string, value: any, config: Property) {
  switch (config.type) {
    case 'device':
      return value === deviceId
    case 'modification':
      return (value as Modification).deviceId === deviceId
    case 'array':
      return (value as Array<any>).some(value =>
        configHasDevice(deviceId, value, config.items),
      )
    case 'object':
      return Object.entries(config.properties).some(([key, config]) =>
        configHasDevice(deviceId, value[key], config),
      )
    default:
      return false
  }
}
