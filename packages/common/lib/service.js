'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ServiceManager = exports.Service = exports.StateQuery = undefined;

var _regenerator = require('/home/rasmus/Development/RAXA/packages/common/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _log = require('./log');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

function selectScope(scope, state) {
    if (typeof scope === 'string' || typeof scope === 'number') {
        return state && state[scope];
    } else if (Array.isArray(scope)) {
        throw Error('array scope not impelemented');
    } else {
        var keys = Object.keys(scope);
        if (keys.length === 1) {
            var subState = selectScope(keys[0], state);
            return selectScope(scope[keys[0]], subState);
        } else {
            throw Error('object array scope not impelemented');
        }
    }
}
function compareProps(element, where, whereProps) {
    if (!element) return false;
    return whereProps.every(function (prop) {
        if (where[prop] && _typeof(where[prop]) === 'object') {
            return compareProps(element[prop], where[prop], Object.keys(where[prop]));
        }
        return element[prop] === where[prop];
    });
}
function filterList(list, options) {
    if (!options) return list;
    if (options.where) {
        var properties = Object.keys(options.where);
        list = list.filter(function (element) {
            return compareProps(element, options.where, properties);
        });
    }
    return list;
}

var StateQuery = exports.StateQuery = function () {
    function StateQuery(storage) {
        _classCallCheck(this, StateQuery);

        this.storage = storage;
    }

    _createClass(StateQuery, [{
        key: 'scalar',
        value: function scalar(scope, options) {
            return this.list(scope, options)[0];
        }
    }, {
        key: 'list',
        value: function list(scope, options) {
            var selectedData = selectScope(scope, this.storage.getState());
            if (!selectedData) return [];
            if (Array.isArray(selectedData)) return filterList(selectedData, options);
            return filterList(Object.values(selectedData), options);
        }
    }]);

    return StateQuery;
}();

var Service = exports.Service = function () {
    function Service() {
        _classCallCheck(this, Service);
    }

    _createClass(Service, [{
        key: 'start',

        /**
         * Called when the service is stared, either becuse of beeing activated or when RAXA
         * is starting. If a Promise is returned then RAXA will wait for it to be resolved.
         */
        value: function start() {}
        /**
         * Called when the service is stopped, either becuse of beeing deactivated or when RAXA
         * is stopping. If a Promise is returned then RAXA will wait for it to be resolved.
         */

    }, {
        key: 'stop',
        value: function stop() {}
    }]);

    return Service;
}();

var ServiceManager = exports.ServiceManager = function () {
    function ServiceManager(rootLogger) {
        _classCallCheck(this, ServiceManager);

        this.rootLogger = rootLogger;
        this.runningServices = {};
        this.startOrder = [];
        this.log = new _log.Log('ServiceManager', rootLogger);
    }
    /**
     * Starts all passed services
     */


    _createClass(ServiceManager, [{
        key: 'startServices',
        value: function startServices() {
            for (var _len = arguments.length, services = Array(_len), _key = 0; _key < _len; _key++) {
                services[_key] = arguments[_key];
            }

            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, service;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context.prev = 3;
                                _iterator = services[Symbol.iterator]();

                            case 5:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context.next = 12;
                                    break;
                                }

                                service = _step.value;
                                _context.next = 9;
                                return this.startService(service);

                            case 9:
                                _iteratorNormalCompletion = true;
                                _context.next = 5;
                                break;

                            case 12:
                                _context.next = 18;
                                break;

                            case 14:
                                _context.prev = 14;
                                _context.t0 = _context['catch'](3);
                                _didIteratorError = true;
                                _iteratorError = _context.t0;

                            case 18:
                                _context.prev = 18;
                                _context.prev = 19;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 21:
                                _context.prev = 21;

                                if (!_didIteratorError) {
                                    _context.next = 24;
                                    break;
                                }

                                throw _iteratorError;

                            case 24:
                                return _context.finish(21);

                            case 25:
                                return _context.finish(18);

                            case 26:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[3, 14, 18, 26], [19,, 21, 25]]);
            }));
        }
    }, {
        key: 'startService',
        value: function startService(service) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
                var name, serviceInstance;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                name = service.name;

                                this.log.info('Starting service ' + name);
                                serviceInstance = new service();

                                this.configureService(service, serviceInstance);
                                _context2.next = 6;
                                return serviceInstance.start();

                            case 6:
                                this.startOrder.push(name);
                                this.runningServices[service.name] = serviceInstance;
                                this.log.info('Started service ' + name);
                                return _context2.abrupt('return', serviceInstance);

                            case 10:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    }, {
        key: 'configureService',
        value: function configureService(service, serviceInstance) {
            serviceInstance.log = new _log.Log(service.name, this.rootLogger);
            serviceInstance.serviceManager = this;
            var storage = this.runningServices.StorageService;
            if (storage) {
                serviceInstance.state = new StateQuery(storage);
                serviceInstance.dispatch = storage.dispatch;
            }
        }
        /**
         * Stops all services in the reverse order of how they started
         */

    }, {
        key: 'stopServices',
        value: function stopServices() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
                var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, name;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context3.prev = 3;
                                _iterator2 = this.startOrder.reverse()[Symbol.iterator]();

                            case 5:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context3.next = 12;
                                    break;
                                }

                                name = _step2.value;
                                _context3.next = 9;
                                return this.stopService(name);

                            case 9:
                                _iteratorNormalCompletion2 = true;
                                _context3.next = 5;
                                break;

                            case 12:
                                _context3.next = 18;
                                break;

                            case 14:
                                _context3.prev = 14;
                                _context3.t0 = _context3['catch'](3);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context3.t0;

                            case 18:
                                _context3.prev = 18;
                                _context3.prev = 19;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 21:
                                _context3.prev = 21;

                                if (!_didIteratorError2) {
                                    _context3.next = 24;
                                    break;
                                }

                                throw _iteratorError2;

                            case 24:
                                return _context3.finish(21);

                            case 25:
                                return _context3.finish(18);

                            case 26:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[3, 14, 18, 26], [19,, 21, 25]]);
            }));
        }
    }, {
        key: 'stopService',
        value: function stopService(name) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee4() {
                var service;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                this.log.info('Stopping service ' + name);
                                service = this.runningServices[name];

                                if (service) {
                                    _context4.next = 4;
                                    break;
                                }

                                return _context4.abrupt('return', this.log.warn('Service ' + name + ' is not running'));

                            case 4:
                                if (!service.stop) {
                                    _context4.next = 7;
                                    break;
                                }

                                _context4.next = 7;
                                return service.stop();

                            case 7:
                                this.startOrder = this.startOrder.filter(function (n) {
                                    return n !== name;
                                });
                                delete this.runningServices[name];
                                this.log.info('Stopped service ' + name);

                            case 10:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        }
    }]);

    return ServiceManager;
}();
//# sourceMappingURL=service.js.map
