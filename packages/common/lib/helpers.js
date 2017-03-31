"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createModification = createModification;
exports.isStatus = isStatus;
exports.declareInterfaces = declareInterfaces;
function createModification(device, status, value) {
    return {
        deviceId: device.id,
        interfaceId: status.interfaceId,
        statusId: status.id,
        value: value
    };
}
function isStatus(modification, status) {
    return modification.interfaceId === status.interfaceId && modification.statusId === status.id;
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
function declareInterfaces(interfaces) {
    return interfaces;
}
//# sourceMappingURL=helpers.js.map
