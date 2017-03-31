'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deviceMutations = exports.deviceQueries = exports.DeviceType = undefined;

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _graphql = require('graphql');

var _graphqlTypeJson = require('graphql-type-json');

var _graphqlTypeJson2 = _interopRequireDefault(_graphqlTypeJson);

var _graphqlVerified = require('graphql-verified');

var _joi = require('joi');

var joi = _interopRequireWildcard(_joi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var DeviceType = exports.DeviceType = (0, _graphqlVerified.buildType)({
    name: 'Device',
    fields: {
        id: { type: _graphql.GraphQLString },
        name: { type: _graphql.GraphQLString },
        pluginId: { type: _graphql.GraphQLString },
        deviceClassId: { type: _graphql.GraphQLString },
        config: { type: _graphqlTypeJson2.default },
        interfaces: { type: [_graphql.GraphQLString] }
    },
    readRules: false,
    writeRules: false
});
var deviceQueries = exports.deviceQueries = (0, _graphqlVerified.buildQueries)({
    devices: {
        type: [DeviceType],
        validate: joi.object({}),
        resolve: function resolve(_, _ref, _ref2) {
            var storage = _ref2.storage;

            _objectDestructuringEmpty(_ref);

            return Object.values(storage.getState().devices);
        }
    }
});
var deviceMutations = exports.deviceMutations = (0, _graphqlVerified.buildMutations)({
    upsertDevice: {
        type: DeviceType,
        validate: joi.object({
            device: joi.object({
                id: joi.string().optional(),
                name: joi.string().required(),
                pluginId: joi.string().required(),
                deviceClassId: joi.string().required(),
                config: joi.object()
            })
        }),
        args: {
            device: { type: DeviceType }
        },
        writeRules: false,
        resolve: function resolve(_, _ref3, _ref4) {
            var device = _ref3.device;
            var storage = _ref4.storage;

            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                storage.upsertDevice(device);

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    },
    callDevice: {
        type: DeviceType,
        validate: joi.object({
            deviceId: joi.string(),
            interfaceId: joi.string(),
            method: joi.string(),
            arguments: joi.string()
        }),
        writeRules: false,
        resolve: function resolve(_, call, _ref5) {
            var plugins = _ref5.plugins;

            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                plugins.callDevice(call);

                            case 1:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    },
    setDeviceStatus: {
        type: DeviceType,
        validate: joi.object({
            deviceId: joi.string(),
            interfaceId: joi.string(),
            statusId: joi.string(),
            value: joi.string()
        }),
        writeRules: false,
        resolve: function resolve(_, modification, _ref6) {
            var plugins = _ref6.plugins;

            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                plugins.setDeviceStatus(modification);

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }
});
//# sourceMappingURL=device.js.map
