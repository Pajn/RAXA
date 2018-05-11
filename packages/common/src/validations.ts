import * as joi from 'joi'
import {
  Call,
  Device,
  DeviceClass,
  Interface,
  Modification,
  ObjectProperty,
  Property,
} from './entities'
import {RaxaError, raxaError} from './errors'
import {State} from './state'

export const propertiesSchema: joi.Schema = joi.object().pattern(
  /^/,
  joi
    .object({
      id: joi.string().required(),
      type: joi
        .string()
        .only('string', 'integer', 'number', 'boolean', 'object')
        .required(),

      optional: joi.boolean(),
      modifiable: joi.boolean(),
    })
    .when(joi.ref('type'), {
      is: 'boolean',
      then: joi.object({
        defaultValue: joi.boolean(),
      }),
    })
    .when(joi.ref('type'), {
      is: 'device',
      then: joi.object({
        interfaceIds: joi.array().items(joi.string().required()),
        deviceClassIds: joi.array().items(joi.string().required()),
      }),
    })
    .when(joi.ref('type'), {
      is: 'number',
      then: joi.object({
        min: joi.number(),
        max: joi.number(),
        unit: joi.string(),
        defaultValue: joi.number(),
      }),
    })
    .when(joi.ref('type'), {
      is: 'integer',
      then: joi.object({
        min: joi.number().integer(),
        max: joi.number().integer(),
        unit: joi.string(),
        defaultValue: joi.number().integer(),
      }),
    })
    .when(joi.ref('type'), {
      is: 'string',
      then: joi.object({
        defaultValue: joi.string(),
      }),
    })
    .when(joi.ref('type'), {
      is: 'object',
      then: joi.object({
        properties: joi.lazy(() => propertiesSchema).required(),
        defaultValue: joi.object(),
      }),
    }),
)

function validateProperties(
  error: RaxaError['type'],
  properties: {[id: string]: Property},
) {
  const result = joi.validate(properties, propertiesSchema)
  if (result.error) {
    throw raxaError({type: error as any, joiError: result.error})
  }
  Object.values(properties)
    .filter(prop => prop.type === 'object' && prop.defaultValue)
    .forEach((prop: ObjectProperty<any>) => {
      const schema = propertiesToJoi(prop.properties)
      const result = joi.validate(prop.defaultValue, schema)
      if (result.error) {
        throw raxaError({type: error as any, joiError: result.error})
      }
    })
}

export function validateInterfaces(state: State, interfaceIds: Array<string>) {
  interfaceIds.forEach(iface => {
    if (!state.interfaces[iface]) {
      throw raxaError({type: 'missingInterface', interfaceId: iface})
    }
  })
}

export function validateDevice(state: State, device: Device): Device {
  if (device.interfaceIds) {
    validateInterfaces(state, device.interfaceIds)
  }
  const deviceClass = state.deviceClasses[device.deviceClassId]
  if (!deviceClass) {
    throw raxaError({
      type: 'missingDeviceClass',
      deviceClassId: device.deviceClassId,
    })
  }
  if (!deviceClass.config) {
    if (device.config) throw new Error('no config allowed')
    return device
  }
  const joiSchema = joi.object({
    id: joi.string().allow(''),
    name: joi.string().required(),
    pluginId: joi.string().required(),
    deviceClassId: joi.string().required(),
    config: propertiesToJoi(deviceClass.config),
    interfaceIds: joi.array().items(joi.string().required()),
  })
  const result = joi.validate(device, joiSchema)
  if (result.error) {
    throw raxaError({type: 'invalidDevice', joiError: result.error})
  }

  return result.value
}

export function validateDeviceClass(state: State, deviceClass: DeviceClass) {
  validateInterfaces(state, deviceClass.interfaceIds)
  if (deviceClass.config) {
    // validateProperties('invalidDeviceClass', deviceClass.config)
  }
}

export function validateInterface(iface: Interface) {
  if (iface.status) {
    // validateProperties('invalidInterface', iface.status)
  }
}

function propertiesToJoi(properties: {[id: string]: Property}) {
  const joiObject = {}
  Object.entries(properties).forEach(([key, value]) => {
    joiObject[key] = propertyToJoi(value)
  })

  return joi.object(joiObject).required()
}

function propertyToJoi(property: Property, optional = false) {
  let joiRule

  switch (property.type) {
    case 'action':
      joiRule = joi.alternatives([
        joi.object({
          type: joi
            .string()
            .required()
            .only('call'),
          deviceId: joi.string().required(),
          interfaceId: joi.string().required(),
          method: joi.string().required(),
          arguments: joi.object().required(),
        }),
        joi.object({
          type: joi
            .string()
            .required()
            .only('modification'),
          deviceId: joi.string().required(),
          interfaceId: joi.string().required(),
          statusId: joi.string().required(),
          value: joi.any().required(),
        }),
      ])
      break
    case 'array':
      joiRule = joi.array().items(propertyToJoi(property.items, true))
      break
    case 'boolean':
      joiRule = joi.boolean()
      break
    case 'device':
      joiRule = joi.string()
      break
    case 'enum':
      joiRule = joi.alternatives(joi.string(), joi.number())
      // .only(property.values.map(value => value.value.toString()))
      break
    case 'modification':
      joiRule = joi.object({
        deviceId: joi.string().required(),
        interfaceId: joi.string().required(),
        statusId: joi.string().required(),
        value: joi.any().required(),
      })
      break
    case 'integer':
      joiRule = joi.number().integer()
    // fall through
    case 'number':
      let numberJoiRule: joi.NumberSchema = joiRule || joi.number()
      if (property.min !== undefined) {
        numberJoiRule = numberJoiRule.min(property.min)
      }
      if (property.max !== undefined) {
        numberJoiRule = numberJoiRule.max(property.max)
      }

      joiRule = numberJoiRule
      break
    case 'string':
      joiRule = joi.string()
      break
  }

  if (!property.optional && !optional) {
    joiRule = joiRule.required()
  }

  return joiRule
}

export function validateAction(state: State, action: Call | Modification) {
  const device = state.devices[action.deviceId]
  const iface = state.interfaces[action.interfaceId]
  if (!device)
    throw raxaError({type: 'missingDevice', deviceId: action.deviceId})
  if (!iface)
    throw raxaError({type: 'missingInterface', interfaceId: action.interfaceId})
  const deviceClass = state.deviceClasses[device.deviceClassId]
  if (
    !(device.interfaceIds || deviceClass.interfaceIds).includes(
      action.interfaceId,
    )
  ) {
    throw Error('Device does not implement interface')
  }
}
