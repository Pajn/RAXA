'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.getPageInsights = getPageInsights;

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
function getPageInsights(objectId) {
    var _this = this;

    var state = _store.store.getState();
    var since = Math.round(state.period.from / 1000);
    var until = Math.round(state.period.to / 1000);
    var jwt = _store.store.getState().user.token;
    return function (dispatch) {
        return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee() {
            var response, data, buckets;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            dispatch((0, _actions.action)(_actions.actions.updateBucket, []));
                            _context.next = 3;
                            return (0, _isomorphicFetch2.default)(_environment.domain + '/page-insights?token=' + jwt + '&objectId=' + objectId + '&since=' + since + '&until=' + until);

                        case 3:
                            response = _context.sent;
                            _context.next = 6;
                            return response.json();

                        case 6:
                            data = _context.sent;
                            buckets = data.reduce(function (buckets, bucket) {
                                var _bucket$values = bucket.values,
                                    values = _bucket$values === undefined ? [] : _bucket$values;

                                if (bucket.name !== 'promotable_posts') {
                                    values = values.map(function (_ref) {
                                        var value = _ref.value,
                                            end_time = _ref.end_time,
                                            timestamp = _ref.timestamp;
                                        return {
                                            value: value,
                                            timestamp: end_time ? new Date(end_time).getTime() : new Date(timestamp).getTime()
                                        };
                                    });
                                }
                                buckets[bucket.name] = values;
                                return buckets;
                            }, {});

                            if (buckets.promotable_posts) {
                                buckets.promotable_posts.sort(function (postA, postB) {
                                    return postB.likes.summary.total_count - postA.likes.summary.total_count || postB.comments.summary.total_count - postA.comments.summary.total_count;
                                });
                            }
                            dispatch((0, _actions.action)(_actions.actions.updateBucket, buckets));

                        case 10:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    };
}
//# sourceMappingURL=insights.js.map
