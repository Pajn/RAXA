'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StorageService = undefined;

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nedbPersist = require('nedb-persist');

var _nedbPersist2 = _interopRequireDefault(_nedbPersist);

var _raxaCommon = require('raxa-common');

var _reduxDecorated = require('redux-decorated');

var _redux = require('redux');

var _reduxPersist = require('redux-persist');

var _validations = require('../validations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var deviceReducer = (0, _reduxDecorated.createReducer)({}).when(_raxaCommon.actions.deviceAdded, function (state, _ref) {
    var device = _ref.device;
    return Object.assign({}, state, _defineProperty({}, device.id, device));
}).when(_raxaCommon.actions.deviceUpdated, function (state, _ref2) {
    var device = _ref2.device;
    return Object.assign({}, state, _defineProperty({}, device.id, device));
}).build();
var deviceClassReducer = (0, _reduxDecorated.createReducer)({}).when(_raxaCommon.actions.deviceClassAdded, function (state, _ref3) {
    var deviceClass = _ref3.deviceClass;
    return Object.assign({}, state, _defineProperty({}, deviceClass.id, deviceClass));
}).when(_raxaCommon.actions.deviceClassUpdated, function (state, _ref4) {
    var deviceClass = _ref4.deviceClass;
    return Object.assign({}, state, _defineProperty({}, deviceClass.id, deviceClass));
}).build();
var interfaceReducer = (0, _reduxDecorated.createReducer)(_raxaCommon.defaultInterfaces).when(_raxaCommon.actions.interfaceAdded, function (state, _ref5) {
    var iface = _ref5.iface;
    return Object.assign({}, state, _defineProperty({}, iface.id, iface));
}).when(_raxaCommon.actions.interfaceUpdated, function (state, _ref6) {
    var iface = _ref6.iface;
    return Object.assign({}, state, _defineProperty({}, iface.id, iface));
}).build();
var pluginReducer = (0, _reduxDecorated.createReducer)({}).when(_raxaCommon.actions.pluginAdded, function (state, _ref7) {
    var plugin = _ref7.plugin;
    return Object.assign({}, state, _defineProperty({}, plugin.id, plugin));
}).when(_raxaCommon.actions.pluginUpdated, function (state, _ref8) {
    var plugin = _ref8.plugin;
    return Object.assign({}, state, _defineProperty({}, plugin.id, plugin));
}).build();
var statusReducer = (0, _reduxDecorated.createReducer)({}).when(_raxaCommon.actions.statusUpdated, function (state, _ref9) {
    var deviceId = _ref9.deviceId,
        interfaceId = _ref9.interfaceId,
        statusId = _ref9.statusId,
        value = _ref9.value;
    return (0, _reduxDecorated.updateIn)([deviceId, interfaceId, statusId], value, state);
}).build();

var StorageService = exports.StorageService = function (_Service) {
    _inherits(StorageService, _Service);

    function StorageService() {
        _classCallCheck(this, StorageService);

        var _this = _possibleConstructorReturn(this, (StorageService.__proto__ || Object.getPrototypeOf(StorageService)).apply(this, arguments));

        _this.dispatch = function (a, payload) {
            _this.store.dispatch((0, _reduxDecorated.action)(a, payload));
        };
        return _this;
    }

    _createClass(StorageService, [{
        key: 'start',
        value: function start() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var _this2 = this;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.store = (0, _redux.createStore)((0, _redux.combineReducers)({
                                    devices: deviceReducer,
                                    deviceClasses: deviceClassReducer,
                                    interfaces: interfaceReducer,
                                    plugins: pluginReducer,
                                    status: statusReducer
                                }), (0, _reduxPersist.autoRehydrate)());
                                this.getState = this.store.getState;
                                _context.next = 4;
                                return new Promise(function (resolve) {
                                    (0, _reduxPersist.persistStore)(_this2.store, { storage: (0, _nedbPersist2.default)({ filename: 'db.json' }) }, resolve);
                                });

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    }, {
        key: 'stop',
        value: function stop() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    }, {
        key: 'installInterface',
        value: function installInterface(iface) {
            this.log.info('Installing interface ' + iface.id);
            var state = this.getState();
            (0, _validations.validateInterface)(iface);
            if (state.interfaces[iface.id]) {
                this.dispatch(_raxaCommon.actions.interfaceUpdated, { iface: iface });
            } else {
                this.dispatch(_raxaCommon.actions.interfaceAdded, { iface: iface });
            }
        }
    }, {
        key: 'installDeviceClass',
        value: function installDeviceClass(deviceClass) {
            this.log.info('Installing device class ' + deviceClass.id);
            var state = this.getState();
            (0, _validations.validateDeviceClass)(state, deviceClass);
            if (state.deviceClasses[deviceClass.id]) {
                this.dispatch(_raxaCommon.actions.deviceClassUpdated, { deviceClass: deviceClass });
            } else {
                this.dispatch(_raxaCommon.actions.deviceClassAdded, { deviceClass: deviceClass });
            }
        }
    }, {
        key: 'installPlugin',
        value: function installPlugin(plugin) {
            this.log.info('Installing plugin ' + plugin.id);
            var state = this.getState();
            if (state.plugins[plugin.id]) {
                this.dispatch(_raxaCommon.actions.pluginUpdated, { plugin: plugin });
            } else {
                this.dispatch(_raxaCommon.actions.pluginAdded, { plugin: plugin });
            }
        }
    }, {
        key: 'upsertDevice',
        value: function upsertDevice(device) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
                var plugins, state;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                plugins = this.serviceManager.runningServices.PluginSupervisor;

                                this.log.info('Upsert device ' + device.id);
                                state = this.getState();

                                device = (0, _validations.validateDevice)(state, device);

                                if (!device.id) {
                                    _context3.next = 8;
                                    break;
                                }

                                this.dispatch(_raxaCommon.actions.deviceUpdated, { device: device });
                                _context3.next = 16;
                                break;

                            case 8:
                                device.id = Date.now().toString();
                                _context3.next = 11;
                                return plugins.onDeviceCreated(device);

                            case 11:
                                _context3.t0 = _context3.sent;

                                if (_context3.t0) {
                                    _context3.next = 14;
                                    break;
                                }

                                _context3.t0 = device;

                            case 14:
                                device = _context3.t0;

                                this.dispatch(_raxaCommon.actions.deviceAdded, { device: device });

                            case 16:
                                return _context3.abrupt('return', this.getState().devices[device.id]);

                            case 17:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: 'updateDevice',
        value: function updateDevice(device) {
            this.log.info('Update device ' + device.id);
            var state = this.getState();
            if (state.plugins[device.id]) {
                this.dispatch(_raxaCommon.actions.deviceUpdated, { device: device });
            }
        }
    }]);

    return StorageService;
}(_raxaCommon.Service);
//# sourceMappingURL=storage.js.map
