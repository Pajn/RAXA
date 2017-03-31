'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ApiService = undefined;

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _graphqlServerHapi = require('graphql-server-hapi');

var _hapi = require('hapi');

var _raxaCommon = require('raxa-common');

var _schema = require('../graphql/schema');

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

function register(server, options) {
    return new Promise(function (resolve, reject) {
        server.register(options, function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

var ApiService = exports.ApiService = function (_Service) {
    _inherits(ApiService, _Service);

    function ApiService() {
        _classCallCheck(this, ApiService);

        return _possibleConstructorReturn(this, (ApiService.__proto__ || Object.getPrototypeOf(ApiService)).apply(this, arguments));
    }

    _createClass(ApiService, [{
        key: 'start',
        value: function start() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var server, storage, plugins, context;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                server = new _hapi.Server();
                                storage = this.serviceManager.runningServices.StorageService;
                                plugins = this.serviceManager.runningServices.PluginSupervisor;
                                context = { storage: storage, plugins: plugins };

                                server.connection({ port: 9000 });
                                _context.next = 7;
                                return register(server, {
                                    register: _graphqlServerHapi.graphqlHapi,
                                    options: {
                                        path: '/graphql',
                                        graphqlOptions: { schema: _schema.schema, context: context }
                                    }
                                });

                            case 7:
                                _context.next = 9;
                                return register(server, {
                                    register: _graphqlServerHapi.graphiqlHapi,
                                    options: {
                                        path: '/graphiql',
                                        graphiqlOptions: {
                                            endpointURL: '/graphql'
                                        }
                                    }
                                });

                            case 9:
                                return _context.abrupt('return', new Promise(function (resolve, reject) {
                                    server.start(function (err) {
                                        if (err) return reject(err);
                                        resolve(server);
                                    });
                                }));

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    }]);

    return ApiService;
}(_raxaCommon.Service);
//# sourceMappingURL=api.js.map
