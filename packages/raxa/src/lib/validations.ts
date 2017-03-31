import * as joi from 'joi'
import {raxaError, Device, Property, Interface, DeviceClass, RaxaError, Call} from 'raxa-common'
import {State} from 'raxa-common/lib/state'
import {Modification} from '../../../common/lib/entities'

export const propertiesSchema: joi.Schema = joi.object().pattern(/^/, joi.object({
  type: joi.string().only('string', 'integer', 'number', 'boolean', 'object').required(),

  optional: joi.boolean(),
  modifiable: joi.boolean(),
}))
  .when(joi.ref('type'), {is: 'string', then: joi.object({
    defaultValue: joi.string(),
  })})
  .when(joi.ref('type'), {is: 'boolean', then: joi.object({
    defaultValue: joi.boolean(),
  })})
  .when(joi.ref('type'), {is: 'number', then: joi.object({
    min: joi.number(),
    max: joi.number(),
    unit: joi.string(),
    defaultValue: joi.number(),
  })})
  .when(joi.ref('type'), {is: 'integer', then: joi.object({
    min: joi.number().integer(),
    max: joi.number().integer(),
    unit: joi.string(),
    defaultValue: joi.number().integer(),
  })})
  .when(joi.ref('type'), {is: 'object', then: joi.object({
    properties: joi.lazy(() => propertiesSchema).required(),
    defaultValue: joi.object(),
  })})

function validateProperties(error: RaxaError['type'], properties: {[id: string]: Property}) {
  const result = joi.validate(properties, propertiesSchema)
  if (result.error) {
    throw raxaError({type: error as any, joiError: result.error})
  }
  Object.values(properties)
    .filter(prop => prop.type === 'object' && prop.defaultValue)
    .forEach(prop => {
      const schema = propertiesToJoi(prop.properties!)
      const result = joi.validate(prop.defaultValue, schema)
      if (result.error) {
        throw raxaError({type: error as any, joiError: result.error})
      }
    })
}

export function validateInterfaces(state: State, interfaces: Array<string>) {
  interfaces.forEach(iface => {
    if (!state.interfaces[iface]) {
      throw raxaError({type: 'missingInterface', interfaceId: iface})
    }
  })
}

export function validateDevice(state: State, device: Device): Device {
  if (device.interfaces) {
    validateInterfaces(state, device.interfaces)
  }
  const deviceClass = state.deviceClasses[device.deviceClassId]
  if (!deviceClass) {
    throw raxaError({type: 'missingDeviceClass', deviceClassId: device.deviceClassId})
  }
  if (!deviceClass.config) {
    if (device.config) throw 'no config allowed'
    return device
  }
  const joiSchema = joi.object({
    id: joi.string().allow(''),
    name: joi.string().required(),
    pluginId: joi.string().required(),
    deviceClassId: joi.string().required(),
    config: propertiesToJoi(deviceClass.config),
    interfaces: joi.array().items(joi.string().required()),
  })
  const result = joi.validate(device, joiSchema)
  if (result.error) {
     throw raxaError({type: 'invalidDevice', joiError: result.error})
  }

  return result.value
}

export function validateDeviceClass(state: State, deviceClass: DeviceClass) {
  validateInterfaces(state, deviceClass.interfaces)
  if (deviceClass.config) {
    validateProperties('invalidDeviceClass', deviceClass.config)
  }
}

export function validateInterface(iface: Interface) {
  if (iface.status) {
    validateProperties('invalidInterface', iface.status)
  }
}

function propertiesToJoi(properties: {[id: string]: Property}) {
  const joiObject = {}
  Object.entries(properties).forEach(([key, value]) => {
    let joiRule

    switch (value.type) {
      case 'string':
        joiRule = joi.string()
        break
      case 'integer':
        joiRule = joi.number().integer()
        break
        // fall through
      case 'number':
        let numberJoiRule: joi.NumberSchema = joiRule || joi.number()
        if (value.min !== undefined) {
          numberJoiRule = numberJoiRule.min(value.min)
        }
        if (value.max !== undefined) {
          numberJoiRule = numberJoiRule.max(value.max)
        }

        joiRule = numberJoiRule
        break
      case 'boolean':
        joiRule = joi.boolean()
        break
    }

    if (!value.optional) {
      joiRule = joiRule.required()
    }

    joiObject[key] = joiRule
  })

  return joi.object(joiObject).required()
}

export function validateAction(state: State, action: Call|Modification) {
  const device = state.devices[action.deviceId]
  const iface = state.interfaces[action.interfaceId]
  if (!device) throw raxaError({type: 'missingDevice', deviceId: action.deviceId})
  if (!iface) throw raxaError({type: 'missingInterface', interfaceId: action.interfaceId})
  const deviceClass = state.deviceClasses[device.deviceClassId]
  if (!(device.interfaces || deviceClass.interfaces).includes(action.interfaceId)) {
    throw Error('Device does not implement inteface')
  }
}
