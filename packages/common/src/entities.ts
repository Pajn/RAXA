export type Awaitable<T> = T | Promise<T>
export type Variable = {$ref: string}

export interface Device {
  id: string
  /**
   * Name of this Device, it must be unique.
   */
  name: string
  /**
   * Id of the plugin that owns this Device.
   */
  pluginId: string
  /**
   * Id of the DeviceClass the Device implements.
   */
  deviceClassId: string
  types?: Array<DeviceType>
  /**
   * Configuration values for the plugin.
   */
  config?: {[id: string]: any}
  /**
   * A list with ids of the Interfaces that the Device implements.
   */
  interfaceIds?: Array<string>
  /**
   * Variables of the device as required by the implemented interfaces.
   * Every implemented interface with variables have its own object with its variables.
   */
  variables?: {[interfaceId: string]: {[variableName: string]: any}}
}

export enum DeviceType {
  Group = 'Group',
  Light = 'Light',
  Outlet = 'Outlet',
  Scenery = 'Scenery',
  Thermometer = 'Thermometer',
  Connector = 'Connector',
  Automation = 'Automation',
}

/**
 * Every Device is created from a DeviceClass that describes
 * what the device implements and requires.
 *
 * DeviceClasses is provided by plugins while Devices is
 * created primarily by the user.
 */
export interface DeviceClass {
  id: string
  name?: string
  types: Array<DeviceType>
  shortDescription?: string
  description?: string
  allowManualCreation?: boolean
  /**
   * Id of the plugin that owns this DeviceClass.
   */
  pluginId: string
  /**
   * Configuration values for the plugin that is set by the user while creating the Device.
   */
  config?: {[id: string]: Property}
  /**
   * A list with names of the Interfaces that the Device created from this class implements.
   */
  interfaceIds: Array<string>
  /**
   * Static variables of the device as required by the implemented interfaces.
   * Every implemented interface with variables have its own object with its variables.
   */
  variables?: {[interfaceId: string]: {[variableName: string]: any}}
}

export interface Interface {
  id: string
  name?: string
  shortDescription?: string
  description?: string
  /**
   * Id of the plugin that specifies this Interface.
   * undefined if specified by RAXA.
   */
  pluginId?: string

  methods?: {[method: string]: Method}
  status?: {[status: string]: Property}
  events?: {[event: string]: Property}
  variables?: {[variable: string]: {}}
}

export interface Call<TArgs = any> {
  /**
   * Id of the Device to be called.
   */
  deviceId: string
  /**
   * Id of the interface the method is defined in.
   */
  interfaceId: string
  /**
   * Method to be called.
   */
  method: string
  /**
   * Arguments to the method.
   */
  arguments: TArgs
}

export interface Modification<TValue = any> {
  /**
   * Id of the Device to be modified.
   */
  deviceId: string
  /**
   * Id of the interface the status is defined in.
   */
  interfaceId: string
  /**
   * Status to be modified.
   */
  statusId: string
  /**
   * New value of the status.
   */
  value: TValue
}

export type Action =
  | ({type: 'call'} & Call)
  | ({type: 'modification'} & Modification)

export interface Method {
  id: string
  name?: string
  arguments: {[name: string]: Property}
  showInSettings?: boolean
}

export interface PropertyBase {
  id: string
  name?: string
  shortDescription?: string
  description?: string

  optional?: boolean
  modifiable?: boolean
  showInSettings?: boolean
}

export interface ActionProperty extends PropertyBase {
  type: 'action'
  interfaceIds?: Array<string>
  deviceClassIds?: Array<string>
}

export interface ArrayProperty<T> extends PropertyBase {
  type: 'array'
  defaultValue?: Array<T>
  items: Property
  minLength?: number
  maxLength?: number
}

export interface BooleanProperty extends PropertyBase {
  type: 'boolean'
  defaultValue?: boolean
}

export interface DeviceProperty extends PropertyBase {
  type: 'device'
  interfaceIds?: Array<string>
  deviceClassIds?: Array<string>
}

export interface EnumProperty<T = string | number> extends PropertyBase {
  type: 'enum'
  values: Array<{name: string; value: T}>
  defaultValue?: T
}

export interface ModificationProperty extends PropertyBase {
  type: 'modification'
  interfaceIds?: Array<string>
  deviceClassIds?: Array<string>
}

export interface NumberProperty extends PropertyBase {
  type: 'number' | 'integer'

  defaultValue?: number

  min?: number
  max?: number
  unit?: string
}

export interface ObjectProperty<T> extends PropertyBase {
  type: 'object'
  defaultValue?: {[prop in keyof T]: T[prop]}
  properties: {[id in keyof T]: Property}
}

export interface StringProperty extends PropertyBase {
  type: 'string'
  defaultValue?: string
  unit?: string
}

export interface VoidProperty extends PropertyBase {
  type: 'void'
}

export type Property =
  | ActionProperty
  | ArrayProperty<any>
  | BooleanProperty
  | DeviceProperty
  | EnumProperty
  | ModificationProperty
  | NumberProperty
  | ObjectProperty<any>
  | StringProperty
  | VoidProperty
export type ValueType = Property['type']
export const valueTypes: Array<ValueType> = [
  'action',
  'array',
  'boolean',
  'device',
  'enum',
  'modification',
  'number',
  'integer',
  'object',
  'string',
  'void',
]

export type Status = Property & {
  interfaceId: string
}

export interface PluginDefinition {
  id: string
  name: string
  shortDescription: string
  description: string
  deviceClasses: {[id: string]: DeviceClass}
  interfaces: {[id: string]: Interface}
}

export interface PluginConfiguration extends PluginDefinition {
  enabled: boolean
}

export type DeviceStatus = {
  id: string
  interfaceId: string
  statusId: string
  value: string
}

export interface GraphQlDevice extends Device {
  name: string
  deviceClass: GraphQlDeviceClass
  interfaces: Array<GraphQlInterface>
  status: Array<DeviceStatus>
}

export interface GraphQlDeviceClass extends DeviceClass {
  name: string
  interfaces: Array<GraphQlInterface>
}

export interface GraphQlInterface extends Interface {
  name: string
}

/**
 * Interface
 * 433MHz Pulse
 *
 * Device Class Connectors (implements 433MHz Pulse)
 * RaxaTellstick
 * Sleipner433
 *
 * Device Class Lamps (requires 433MHz Pulse)
 * Nexa Selflearning
 * Nexa Switch Case
 *
 *
 */
