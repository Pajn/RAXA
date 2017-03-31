'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('/home/rasmus/Development/RAXA/packages/plugin-mysensors/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _interfaces, _statuses;

var _serialport = require('serialport');

var _serialport2 = _interopRequireDefault(_serialport);

var _raxaCommon = require('raxa-common');

var _definitions = require('./definitions');

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

var gwBaud = 115200;
var interfaces = (_interfaces = {}, _defineProperty(_interfaces, _definitions.S_BINARY, _raxaCommon.defaultInterfaces.Light.id), _defineProperty(_interfaces, _definitions.S_DIMMER, _raxaCommon.defaultInterfaces.Dimmer.id), _defineProperty(_interfaces, _definitions.S_RGB_LIGHT, _raxaCommon.defaultInterfaces.RGB.id), _defineProperty(_interfaces, _definitions.S_TEMP, _raxaCommon.defaultInterfaces.Temperature.id), _interfaces);
var statuses = (_statuses = {}, _defineProperty(_statuses, _definitions.V_STATUS, _raxaCommon.defaultInterfaces.Light.status.on), _defineProperty(_statuses, _definitions.V_PERCENTAGE, _raxaCommon.defaultInterfaces.Dimmer.status.level), _defineProperty(_statuses, _definitions.V_RGB, _raxaCommon.defaultInterfaces.RGB.status.color), _defineProperty(_statuses, _definitions.V_TEMP, _raxaCommon.defaultInterfaces.Temperature.status.temp), _statuses);
var names = {};
var serialPorts = {};
function isGateway(device) {
    return device.deviceClassId === 'Serial MySensors Gateway';
}
function hex(value) {
    var string = '';
    if (value < 16) {
        string += '0';
    }
    string += value.toString(16);
    return string;
}
function encode(destination, sensor, command, acknowledge, type, payload) {
    var message = destination.toString(10) + ';' + sensor.toString(10) + ';' + command.toString(10) + ';' + acknowledge.toString(10) + ';' + type.toString(10) + ';';
    if (command === 4) {
        for (var i = 0; i < payload.length; i++) {
            message += hex(payload[i]);
        }
    } else {
        message += payload;
    }
    message += '\n';
    return message;
}

var MySensorsPlugin = function (_Plugin) {
    _inherits(MySensorsPlugin, _Plugin);

    function MySensorsPlugin() {
        _classCallCheck(this, MySensorsPlugin);

        return _possibleConstructorReturn(this, (MySensorsPlugin.__proto__ || Object.getPrototypeOf(MySensorsPlugin)).apply(this, arguments));
    }

    _createClass(MySensorsPlugin, [{
        key: 'onDeviceCreated',
        value: function onDeviceCreated(device) {
            if (isGateway(device)) {
                this.openGateway(device);
            }
        }
    }, {
        key: 'onDeviceStatusModified',
        value: function onDeviceStatusModified(modification, device) {
            var send = this.send.bind(this, device.config.gateway, device.config.node, 0, _definitions.C_SET);
            if ((0, _raxaCommon.isStatus)(modification, _raxaCommon.defaultInterfaces.Light.status.on)) {
                return send(_definitions.V_STATUS, modification.value ? 1 : 0);
            } else if ((0, _raxaCommon.isStatus)(modification, _raxaCommon.defaultInterfaces.Dimmer.status.level)) {
                return send(_definitions.V_PERCENTAGE, ('00' + modification.value).slice(-3));
            } else if ((0, _raxaCommon.isStatus)(modification, _raxaCommon.defaultInterfaces.RGB.status.color)) {
                return send(_definitions.V_RGB, hex(modification.value.red) + hex(modification.value.green) + hex(modification.value.blue));
            }
            throw new Error('Can\'t modify status of ' + modification.interfaceId);
        }
    }, {
        key: 'onDeviceCalled',
        value: function onDeviceCalled(call, device) {
            if (isGateway(device)) {
                var _call$arguments = call.arguments,
                    node = _call$arguments.node,
                    sensor = _call$arguments.sensor,
                    type = _call$arguments.type,
                    subType = _call$arguments.subType,
                    payload = _call$arguments.payload;

                var message = encode(node, sensor, type, 0, subType, payload);
                this.log.debug('transmitted message', message);
                serialPorts[device.id].write(message);
            }
        }
    }, {
        key: 'start',
        value: function start() {
            this.state.list('devices', { where: {
                    pluginId: 'mysensors',
                    deviceClassId: 'Serial MySensors Gateway'
                } }).forEach(this.openGateway.bind(this));
        }
    }, {
        key: 'stop',
        value: function stop() {
            return Promise.all(Object.values(serialPorts).map(function (port) {
                return new Promise(function (resolve) {
                    return port.close(resolve);
                });
            }));
        }
    }, {
        key: 'openGateway',
        value: function openGateway(_ref) {
            var _this2 = this;

            var id = _ref.id,
                config = _ref.config;

            console.log('openGateway', JSON.stringify({ id: id }));
            var serialPort = config.serialPort;
            var port = new _serialport2.default(serialPort, {
                baudrate: gwBaud,
                parser: _serialport2.default.parsers.readline('\n')
            });
            var errors = 0;
            port.on('open', function () {
                _this2.log.info('connected to serial gateway at ' + serialPort);
                serialPorts[id] = port;
                errors = 0;
            });
            port.on('end', function () {
                _this2.log.info('disconnected from gateway at ' + serialPort);
                serialPorts[id];
            });
            port.on('data', function (rd) {
                _this2.receivedMessage(id, rd);
            });
            port.on('error', function () {
                _this2.log.error('connection error - trying to reconnect to ' + serialPort);
                setTimeout(function () {
                    port.open();
                }, Math.pow(errors, 2) * 1000);
                errors++;
            });
        }
    }, {
        key: 'send',
        value: function send(deviceId, node, sensor, type, subType, payload) {
            return this.callDevice({
                deviceId: deviceId,
                interfaceId: 'MySensors Gateway',
                method: 'send',
                arguments: { node: node, sensor: sensor, type: type, subType: subType, payload: payload }
            });
        }
    }, {
        key: 'receivedMessage',
        value: function receivedMessage(deviceId, message) {
            if (message === '') return;
            this.log.debug('received message', message);
            // Decoding message

            var _message$split$map = message.split(';').map(function (p, i) {
                return i === 5 ? p : +p;
            }),
                _message$split$map2 = _slicedToArray(_message$split$map, 6),
                sender = _message$split$map2[0],
                sensor = _message$split$map2[1],
                command = _message$split$map2[2],
                ack = _message$split$map2[3],
                type = _message$split$map2[4],
                payload = _message$split$map2[5];

            switch (command) {
                case _definitions.C_PRESENTATION:
                    this.sensorPresented(deviceId, sender, sensor, type);
                    break;
                case _definitions.C_SET:
                    this.statusUpdate(deviceId, sender, sensor, type, payload);
                    break;
                case _definitions.C_REQ:
                    this.statusRequest(deviceId, sender, sensor, type);
                    break;
                case _definitions.C_INTERNAL:
                    var send = this.send.bind(this, deviceId, sender, sensor, _definitions.C_INTERNAL);
                    switch (type) {
                        case _definitions.I_TIME:
                            send(_definitions.I_TIME, Math.round(Date.now() / 1000));
                            break;
                        case _definitions.I_CONFIG:
                            send(_definitions.I_CONFIG, 'M');
                            break;
                        case _definitions.I_SKETCH_NAME:
                            this.nameReceived(deviceId, sender, payload.trim());
                            break;
                    }
                    break;
            }
        }
    }, {
        key: 'getSensor',
        value: function getSensor(gateway, node, sensor) {
            return this.state.scalar('devices', { where: {
                    pluginId: 'mysensors',
                    deviceClassId: 'MySensors Sensor',
                    config: {
                        gateway: gateway,
                        node: node,
                        sensor: sensor
                    }
                } });
        }
    }, {
        key: 'sensorPresented',
        value: function sensorPresented(gatewayId, nodeId, sensor, type) {
            var _this3 = this;

            if (!interfaces[type]) return;
            var device = this.getSensor(gatewayId, nodeId, sensor);
            if (!device) {
                var createDevice = function createDevice() {
                    var name = names[gatewayId + ':' + nodeId] || 'MySensors ' + interfaces[type] + ' ' + nodeId + ':' + sensor;
                    var device = {
                        id: '',
                        name: name,
                        pluginId: 'mysensors',
                        deviceClassId: 'MySensors Sensor',
                        config: {
                            gateway: gatewayId,
                            node: nodeId,
                            sensor: sensor
                        },
                        interfaces: [interfaces[type]]
                    };
                    _this3.upsertDevice(device);
                };
                if (!names[gatewayId + ':' + nodeId]) {
                    setTimeout(createDevice, 100);
                } else {
                    createDevice();
                }
            }
        }
    }, {
        key: 'nameReceived',
        value: function nameReceived(gatewayId, nodeId, name) {
            names[gatewayId + ':' + nodeId] = name;
            setTimeout(function () {
                delete names[gatewayId + ':' + nodeId];
            }, 10000);
        }
    }, {
        key: 'statusUpdate',
        value: function statusUpdate(gatewayId, nodeId, sensor, type, value) {
            var _this4 = this;

            var status = statuses[type];
            if (!status) return;
            var interfaceId = status.interfaceId,
                statusId = status.id;

            switch (type) {
                case _definitions.V_STATUS:
                    value = +value === 1;
                    break;
                case _definitions.V_TEMP:
                case _definitions.V_PERCENTAGE:
                    value = +value;
                    break;
                case _definitions.V_RGB:
                    value = {
                        red: parseInt(value.substring(0, 2), 16),
                        green: parseInt(value.substring(2, 4), 16),
                        blue: parseInt(value.substring(4, 6), 16)
                    };
                    break;
                default:
                    return;
            }
            var device = this.getSensor(gatewayId, nodeId, sensor);
            if (device) {
                this.dispatch(_raxaCommon.actions.statusUpdated, { deviceId: device.id, interfaceId: interfaceId, statusId: statusId, value: value });
            } else {
                if (type === _definitions.V_TEMP) {
                    var name = names[gatewayId + ':' + nodeId] || 'MySensors ' + interfaces[_definitions.S_TEMP] + ' ' + nodeId + ':' + sensor;
                    var _device = {
                        id: '',
                        name: name,
                        pluginId: 'mysensors',
                        deviceClassId: 'MySensors Sensor',
                        config: {
                            gateway: gatewayId,
                            node: nodeId,
                            sensor: sensor
                        },
                        interfaces: [interfaces[_definitions.S_TEMP]]
                    };
                    this.upsertDevice(_device).then(function (device) {
                        _this4.dispatch(_raxaCommon.actions.statusUpdated, { deviceId: device.id, interfaceId: interfaceId, statusId: statusId, value: value });
                    });
                }
            }
        }
    }, {
        key: 'statusRequest',
        value: function statusRequest(gatewayId, nodeId, sensor, type) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var status, interfaceId, statusId, device, value;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                status = statuses[type];

                                if (status) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt('return');

                            case 3:
                                interfaceId = status.interfaceId, statusId = status.id;
                                device = this.getSensor(gatewayId, nodeId, sensor);

                                if (!device) {
                                    _context.next = 10;
                                    break;
                                }

                                _context.next = 8;
                                return this.state.scalar({ status: _defineProperty({}, device.id, _defineProperty({}, interfaceId, statusId)) });

                            case 8:
                                value = _context.sent;

                                this.onDeviceStatusModified({
                                    deviceId: device.id,
                                    interfaceId: interfaceId,
                                    statusId: statusId,
                                    value: value
                                }, device);

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    }]);

    return MySensorsPlugin;
}(_raxaCommon.Plugin);

exports.default = MySensorsPlugin;
//# sourceMappingURL=index.js.map
