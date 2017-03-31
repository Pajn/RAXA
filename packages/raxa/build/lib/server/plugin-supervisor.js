'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PluginSupervisor = undefined;

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _raxaCommon = require('raxa-common');

var _validations = require('../validations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var PluginManager = function (_ServiceManager) {
    _inherits(PluginManager, _ServiceManager);

    function PluginManager() {
        _classCallCheck(this, PluginManager);

        return _possibleConstructorReturn(this, (PluginManager.__proto__ || Object.getPrototypeOf(PluginManager)).apply(this, arguments));
    }

    _createClass(PluginManager, [{
        key: 'configureService',
        value: function configureService(service, plugin) {
            var _this2 = this;

            _get(PluginManager.prototype.__proto__ || Object.getPrototypeOf(PluginManager.prototype), 'configureService', this).call(this, service, plugin);
            plugin.upsertDevice = function (device) {
                var storage = _this2.supervisor.serviceManager.runningServices.StorageService;
                return storage.upsertDevice(device);
            };
            plugin.setDeviceStatus = function (modification) {
                return _this2.supervisor.setDeviceStatus(modification);
            };
            plugin.callDevice = function (call) {
                return _this2.supervisor.callDevice(call);
            };
        }
    }]);

    return PluginManager;
}(_raxaCommon.ServiceManager);

var PluginSupervisor = exports.PluginSupervisor = function (_Service) {
    _inherits(PluginSupervisor, _Service);

    function PluginSupervisor() {
        _classCallCheck(this, PluginSupervisor);

        var _this3 = _possibleConstructorReturn(this, (PluginSupervisor.__proto__ || Object.getPrototypeOf(PluginSupervisor)).apply(this, arguments));

        _this3.runningPlugins = {};
        return _this3;
    }

    _createClass(PluginSupervisor, [{
        key: 'start',
        value: function start() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var _this4 = this;

                var storage;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.pluginServiceManager = new PluginManager(this.log);
                                this.pluginServiceManager.supervisor = this;
                                this.pluginServiceManager.runningServices.StorageService = this.serviceManager.runningServices.StorageService;
                                storage = this.serviceManager.runningServices.StorageService;
                                _context.next = 6;
                                return Promise.all(['mysensors'].filter(function (plugin) {
                                    return !storage.getState().plugins[plugin];
                                }).map(function (plugin) {
                                    return _this4.installPlugin(plugin);
                                }));

                            case 6:
                                _context.next = 8;
                                return Promise.all(Object.values(storage.getState().plugins).filter(function (plugin) {
                                    return plugin.enabled;
                                }).map(function (plugin) {
                                    return _this4.startPlugin(plugin.id);
                                }));

                            case 8:
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
                var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, plugin;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context2.prev = 3;
                                _iterator = Object.values(this.runningPlugins)[Symbol.iterator]();

                            case 5:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context2.next = 12;
                                    break;
                                }

                                plugin = _step.value;
                                _context2.next = 9;
                                return plugin.stop();

                            case 9:
                                _iteratorNormalCompletion = true;
                                _context2.next = 5;
                                break;

                            case 12:
                                _context2.next = 18;
                                break;

                            case 14:
                                _context2.prev = 14;
                                _context2.t0 = _context2['catch'](3);
                                _didIteratorError = true;
                                _iteratorError = _context2.t0;

                            case 18:
                                _context2.prev = 18;
                                _context2.prev = 19;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 21:
                                _context2.prev = 21;

                                if (!_didIteratorError) {
                                    _context2.next = 24;
                                    break;
                                }

                                throw _iteratorError;

                            case 24:
                                return _context2.finish(21);

                            case 25:
                                return _context2.finish(18);

                            case 26:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[3, 14, 18, 26], [19,, 21, 25]]);
            }));
        }
    }, {
        key: 'installPlugin',
        value: function installPlugin(name) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
                var storage, pluginDefinition, plugin;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                storage = this.serviceManager.runningServices.StorageService;

                                this.log.info('Installing plugin ' + name);
                                pluginDefinition = require('raxa-plugin-' + name + '/plugin.json');
                                plugin = require('raxa-plugin-' + name);

                                if (plugin.default) {
                                    plugin = plugin.default;
                                }

                                if (!(typeof plugin !== 'function')) {
                                    _context3.next = 8;
                                    break;
                                }

                                this.log.warn('Plugin ' + name + ' has no default exported class');
                                return _context3.abrupt('return');

                            case 8:
                                Object.entries(pluginDefinition.interfaces).forEach(function (_ref) {
                                    var _ref2 = _slicedToArray(_ref, 2),
                                        id = _ref2[0],
                                        iface = _ref2[1];

                                    if (id !== iface.id) throw 'Invalid interface id ' + id + ' !== ' + iface.id;
                                    iface.pluginId = name;
                                    storage.installInterface(iface);
                                });
                                Object.entries(pluginDefinition.deviceClasses).forEach(function (_ref3) {
                                    var _ref4 = _slicedToArray(_ref3, 2),
                                        id = _ref4[0],
                                        deviceClass = _ref4[1];

                                    if (id !== deviceClass.id) throw 'Invalid device class id ' + id + ' !== ' + deviceClass.id;
                                    deviceClass.pluginId = name;
                                    storage.installDeviceClass(deviceClass);
                                });
                                storage.installPlugin({ id: name, enabled: true });

                            case 11:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: 'startPlugin',
        value: function startPlugin(name) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee4() {
                var plugin, pluginInstance;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                this.log.info('Starting plugin ' + name);
                                plugin = require('raxa-plugin-' + name);

                                if (plugin.default) {
                                    plugin = plugin.default;
                                }
                                _context4.next = 5;
                                return this.pluginServiceManager.startService(plugin);

                            case 5:
                                pluginInstance = _context4.sent;

                                this.runningPlugins[name] = pluginInstance;

                            case 7:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        }
    }, {
        key: 'getPlugin',
        value: function getPlugin(id) {
            var plugin = this.runningPlugins[id];
            if (!plugin) {
                throw (0, _raxaCommon.raxaError)({ type: 'pluginNotEnabled', pluginId: id });
            }
            return plugin;
        }
    }, {
        key: 'onDeviceCreated',
        value: function onDeviceCreated(device) {
            return this.getPlugin(device.pluginId).onDeviceCreated(device);
        }
    }, {
        key: 'onDeviceCalled',
        value: function onDeviceCalled(call, device) {
            return this.getPlugin(device.pluginId).onDeviceCalled(call, device);
        }
    }, {
        key: 'onDeviceStatusModified',
        value: function onDeviceStatusModified(modification, device) {
            return this.getPlugin(device.pluginId).onDeviceStatusModified(modification, device);
        }
    }, {
        key: 'setDeviceStatus',
        value: function setDeviceStatus(modification) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee5() {
                var storage, state, device, iface, updatedDevice;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                storage = this.serviceManager.runningServices.StorageService;
                                state = storage.getState();

                                (0, _validations.validateAction)(state, modification);
                                device = state.devices[modification.deviceId];
                                iface = state.interfaces[modification.interfaceId];

                                if (!(!iface.status || !iface.status[modification.statusId])) {
                                    _context5.next = 7;
                                    break;
                                }

                                throw (0, _raxaCommon.raxaError)({
                                    type: 'missingStatus',
                                    interfaceId: modification.interfaceId,
                                    statusId: modification.statusId
                                });

                            case 7:
                                _context5.next = 9;
                                return this.getPlugin(device.pluginId).onDeviceStatusModified(modification, device);

                            case 9:
                                updatedDevice = _context5.sent;

                                if (updatedDevice) {
                                    storage.updateDevice(device);
                                }

                            case 11:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: 'callDevice',
        value: function callDevice(call) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee6() {
                var storage, state, device, iface, updatedDevice;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                storage = this.serviceManager.runningServices.StorageService;
                                state = storage.getState();

                                (0, _validations.validateAction)(state, call);
                                device = state.devices[call.deviceId];
                                iface = state.interfaces[call.interfaceId];

                                if (!(!iface.methods || !iface.methods[call.method])) {
                                    _context6.next = 7;
                                    break;
                                }

                                throw (0, _raxaCommon.raxaError)({ type: 'missingMethod', interfaceId: call.interfaceId, method: call.method });

                            case 7:
                                _context6.next = 9;
                                return this.getPlugin(device.pluginId).onDeviceCalled(call, device);

                            case 9:
                                updatedDevice = _context6.sent;

                                if (updatedDevice) {
                                    storage.updateDevice(device);
                                }

                            case 11:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));
        }
    }]);

    return PluginSupervisor;
}(_raxaCommon.Service);
//# sourceMappingURL=plugin-supervisor.js.map
