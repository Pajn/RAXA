'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.getCampaignInsights = getCampaignInsights;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _actions = require('../actions');

var _environment = require('../environment');

var _store = require('../store');

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
function getCampaignInsights() {
    var _this = this;

    var jwt = _store.store.getState().user.token;
    return function (dispatch) {
        return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee() {
            var marketingInsightsResponse, marketingInsights;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _isomorphicFetch2.default)(_environment.domain + '/campaigns?token=' + jwt);

                        case 2:
                            marketingInsightsResponse = _context.sent;
                            _context.next = 5;
                            return marketingInsightsResponse.json();

                        case 5:
                            marketingInsights = _context.sent;

                            dispatch((0, _actions.action)(_actions.actions.updateBucket, marketingInsights));

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    };
}
//# sourceMappingURL=campaigns.js.map
