'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.main = main;

var _raxaCommon = require('raxa-common');

var _api = require('./api');

var _pluginSupervisor = require('./plugin-supervisor');

var _storage = require('./storage');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function main() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        var serviceManager, firstInt;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        serviceManager = new _raxaCommon.ServiceManager();
                        _context.next = 3;
                        return serviceManager.startServices(_storage.StorageService, _pluginSupervisor.PluginSupervisor, _api.ApiService);

                    case 3:
                        firstInt = true;

                        process.on('SIGINT', function () {
                            if (firstInt) {
                                console.log('\n\nStopping services gracefully, press ctrl+c again to force quit\n');
                                firstInt = false;
                                serviceManager.stopServices();
                            } else {
                                process.exit(1);
                            }
                        });

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
//# sourceMappingURL=app.js.map
