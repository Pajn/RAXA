export type Awaitable<T> = T|Promise<T>
export type ValueType = 'string'|'integer'|'number'|'boolean'|'object'
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
  /**
   * Configuration values for the plugin.
   */
  config?: {[id: string]: any}
  /**
   * A list with ids of the Interfaces that the Device implements.
   */
  interfaceIds?: string[]
  /**
   * Variables of the device as required by the implemented interfaces.
   * Every implemented interface with variables have its own object with its variables.
   */
  variables?: {[interfaceId: string]: {[variableName: string]: any}}
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
  shortDescription?: string
  description?: string
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
  interfaceIds: string[]
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

  methods?: {[method: string]: {}}
  status?: {[status: string]: Property}
  variables?: {[variable: string]: {}}
}

export interface Call {
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
  arguments: any
}

export interface Modification {
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
  value: any
}

export interface Property {
  id: string
  type: ValueType
  name?: string
  shortDescription?: string
  description?: string

  defaultValue?: any
  optional?: boolean
  modifiable?: boolean

  properties?: {[id: string]: Property}
  min?: number
  max?: number
  unit?: string
}

export interface Status extends Property {
  interfaceId: string
}

export interface PluginDefinition {
  id: string
  deviceClasses: {[id: string]: DeviceClass}
  interfaces: {[id: string]: Interface}
}

export interface PluginConfiguration {
  id: string
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
