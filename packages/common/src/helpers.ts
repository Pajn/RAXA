import {Device, Interface, Modification, Status} from './entities'

export function createModification(device: Device, status: Status, value): Modification {
  return {
    deviceId: device.id,
    interfaceId: status.interfaceId,
    statusId: status.id,
    value,
  }
}

export function isStatus(modification: Modification, status: Status) {
  return modification.interfaceId === status.interfaceId && modification.statusId === status.id
}


// export function mapObjects<O extends {[id: string]: T}, T, U>(objects: O, mapper: (object: T, key: string) => U): O & {[id: string]: U} {
//   const declaredObjects = {}
//   Object.entries(objects).forEach(([key, object]) => {
//     declaredObjects[key] = mapper(object, key)
//   })
//   return declaredObjects as any
// }

/**
 * Adds an id to each interface and each status
 */
export function declareInterfaces(interfaces: {[id: string]: Interface}) {
  return interfaces
}
