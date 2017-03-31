'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.propertiesSchema = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.validateInterfaces = validateInterfaces;
exports.validateDevice = validateDevice;
exports.validateDeviceClass = validateDeviceClass;
exports.validateInterface = validateInterface;
exports.validateAction = validateAction;

var _joi = require('joi');

var joi = _interopRequireWildcard(_joi);

var _raxaCommon = require('raxa-common');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var propertiesSchema = exports.propertiesSchema = joi.object().pattern(/^/, joi.object({
    type: joi.string().only('string', 'integer', 'number', 'boolean', 'object').required(),
    optional: joi.boolean(),
    modifiable: joi.boolean()
})).when(joi.ref('type'), { is: 'string', then: joi.object({
        defaultValue: joi.string()
    }) }).when(joi.ref('type'), { is: 'boolean', then: joi.object({
        defaultValue: joi.boolean()
    }) }).when(joi.ref('type'), { is: 'number', then: joi.object({
        min: joi.number(),
        max: joi.number(),
        unit: joi.string(),
        defaultValue: joi.number()
    }) }).when(joi.ref('type'), { is: 'integer', then: joi.object({
        min: joi.number().integer(),
        max: joi.number().integer(),
        unit: joi.string(),
        defaultValue: joi.number().integer()
    }) }).when(joi.ref('type'), { is: 'object', then: joi.object({
        properties: joi.lazy(function () {
            return propertiesSchema;
        }).required(),
        defaultValue: joi.object()
    }) });
function validateProperties(error, properties) {
    var result = joi.validate(properties, propertiesSchema);
    if (result.error) {
        throw (0, _raxaCommon.raxaError)({ type: error, joiError: result.error });
    }
    Object.values(properties).filter(function (prop) {
        return prop.type === 'object' && prop.defaultValue;
    }).forEach(function (prop) {
        var schema = propertiesToJoi(prop.properties);
        var result = joi.validate(prop.defaultValue, schema);
        if (result.error) {
            throw (0, _raxaCommon.raxaError)({ type: error, joiError: result.error });
        }
    });
}
function validateInterfaces(state, interfaces) {
    interfaces.forEach(function (iface) {
        if (!state.interfaces[iface]) {
            throw (0, _raxaCommon.raxaError)({ type: 'missingInterface', interfaceId: iface });
        }
    });
}
function validateDevice(state, device) {
    if (device.interfaces) {
        validateInterfaces(state, device.interfaces);
    }
    var deviceClass = state.deviceClasses[device.deviceClassId];
    if (!deviceClass) {
        throw (0, _raxaCommon.raxaError)({ type: 'missingDeviceClass', deviceClassId: device.deviceClassId });
    }
    if (!deviceClass.config) {
        if (device.config) throw 'no config allowed';
        return device;
    }
    var joiSchema = joi.object({
        id: joi.string().allow(''),
        name: joi.string().required(),
        pluginId: joi.string().required(),
        deviceClassId: joi.string().required(),
        config: propertiesToJoi(deviceClass.config),
        interfaces: joi.array().items(joi.string().required())
    });
    var result = joi.validate(device, joiSchema);
    if (result.error) {
        throw (0, _raxaCommon.raxaError)({ type: 'invalidDevice', joiError: result.error });
    }
    return result.value;
}
function validateDeviceClass(state, deviceClass) {
    validateInterfaces(state, deviceClass.interfaces);
    if (deviceClass.config) {
        validateProperties('invalidDeviceClass', deviceClass.config);
    }
}
function validateInterface(iface) {
    if (iface.status) {
        validateProperties('invalidInterface', iface.status);
    }
}
function propertiesToJoi(properties) {
    var joiObject = {};
    Object.entries(properties).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        var joiRule = void 0;
        switch (value.type) {
            case 'string':
                joiRule = joi.string();
                break;
            case 'integer':
                joiRule = joi.number().integer();
                break;
            // fall through
            case 'number':
                var numberJoiRule = joiRule || joi.number();
                if (value.min !== undefined) {
                    numberJoiRule = numberJoiRule.min(value.min);
                }
                if (value.max !== undefined) {
                    numberJoiRule = numberJoiRule.max(value.max);
                }
                joiRule = numberJoiRule;
                break;
            case 'boolean':
                joiRule = joi.boolean();
                break;
        }
        if (!value.optional) {
            joiRule = joiRule.required();
        }
        joiObject[key] = joiRule;
    });
    return joi.object(joiObject).required();
}
function validateAction(state, action) {
    var device = state.devices[action.deviceId];
    var iface = state.interfaces[action.interfaceId];
    if (!device) throw (0, _raxaCommon.raxaError)({ type: 'missingDevice', deviceId: action.deviceId });
    if (!iface) throw (0, _raxaCommon.raxaError)({ type: 'missingInterface', interfaceId: action.interfaceId });
    var deviceClass = state.deviceClasses[device.deviceClassId];
    if (!(device.interfaces || deviceClass.interfaces).includes(action.interfaceId)) {
        throw Error('Device does not implement inteface');
    }
}
//# sourceMappingURL=validations.js.map
