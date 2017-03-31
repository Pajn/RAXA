'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onLoaded = exports.store = undefined;

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reduxPersist = require('redux-persist');

var _buckets = require('./reducers/buckets');

var _campaigns = require('./reducers/campaigns');

var _invite = require('./reducers/invite');

var _pages = require('./reducers/pages');

var _period = require('./reducers/period');

var _user = require('./reducers/user');

var _ad = require('./reducers/ad');

var _menu = require('./reducers/menu');

var _environment = require('./environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loaded = void 0;
var onLoadedCallbacks = [];
var reducer = (0, _redux.combineReducers)({
    buckets: _buckets.buckets,
    campaigns: _campaigns.campaigns,
    invite: _invite.invite,
    pages: _pages.pages,
    period: _period.period,
    selectablePages: _pages.selectablePages,
    user: _user.user,
    ad: _ad.ad,
    menu: _menu.menu
});
var middlewares = [_reduxThunk2.default];
if (!_environment.production) {
    var logger = function logger(_) {
        return function (next) {
            return function (action) {
                console.log('action %s dispatched', action.type, action);
                return next(action);
            };
        };
    };
    middlewares.push(logger);
}
var storeEnhancers = [_redux.applyMiddleware.apply(undefined, middlewares), (0, _reduxPersist.autoRehydrate)()];
if (!_environment.production && window.devToolsExtension) {
    storeEnhancers.push(window.devToolsExtension());
}
var store = exports.store = (0, _redux.createStore)(reducer, _redux.compose.apply(undefined, storeEnhancers));
(0, _reduxPersist.persistStore)(store, { whitelist: ['period', 'user'] }, function () {
    loaded = true;
    onLoadedCallbacks.forEach(function (callback) {
        return callback();
    });
});
var onLoaded = exports.onLoaded = function onLoaded(callback) {
    if (loaded) {
        callback();
    } else {
        onLoadedCallbacks.push(callback);
    }
};
//# sourceMappingURL=store.js.map
