'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.App = undefined;

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _dialog = require('dashboard/dialog');

var _campaignStatistics = require('./components/pages/campaign-statistics');

var _statistics = require('./components/pages/statistics');

var _userInfo = require('./components/pages/user-info');

var _main = require('./components/main');

var _register = require('./components/register');

var _signIn = require('./components/sign-in');

var _startupGuide = require('./components/startup-guide');

var _auth = require('./lib/action-creators/auth');

var _campaigns = require('./lib/action-creators/campaigns');

var _insights = require('./lib/action-creators/insights');

var _pages = require('./lib/action-creators/pages');

var _environment = require('./lib/environment');

var _store = require('./lib/store');

if (window['cetti'] && _environment.production) {
    new cetti.Cetti('bf210f31-347d-11e6-8817-dfab36344b4d').start();
}
window.addEventListener('message', function (_ref) {
    var data = _ref.data;

    if (data.signIn) {
        var _data$signIn = data.signIn,
            jwt = _data$signIn.jwt,
            user = _data$signIn.user,
            company = _data$signIn.company;

        _store.store.dispatch((0, _auth.signedIn)(jwt, user, company, { redirect: false }));
    }
});
(0, _store.onLoaded)(function () {
    if (_store.store.getState().user.user) {
        _store.store.dispatch((0, _pages.getPages)());
    }
});
function requireAuth(nextState, replace, done) {
    (0, _store.onLoaded)(function () {
        var _store$getState$user = _store.store.getState().user,
            user = _store$getState$user.user,
            company = _store$getState$user.company;

        var _nextState$location$q = nextState.location.query,
            jwt = _nextState$location$q.jwt,
            data = _nextState$location$q.data;

        if (jwt) {
            var _JSON$parse = JSON.parse(data),
                _user = _JSON$parse.user,
                _company = _JSON$parse.company;

            if (window.opener) {
                window.opener.postMessage({ signIn: { jwt: jwt, user: _user, company: _company } }, '*');
                window.close();
            } else {
                _store.store.dispatch((0, _auth.signedIn)(jwt, _user, _company, { redirect: false }));
                replace({
                    state: Object.assign({}, nextState, { location: Object.assign({}, nextState.location, { query: {} }) })
                });
            }
        } else if (!user) {
            replace({
                pathname: '/sign-in',
                state: { nextPathname: nextState.location.pathname }
            });
        } else if (!user.name || !user.email || !company.name) {
            _dialog.dialog.open(React.createElement(_reactRedux.Provider, { store: _store.store }, React.createElement(_startupGuide.StartupGuide, null)));
        }
        done();
    });
}
function requireNotAuth(nextState, replace, done) {
    (0, _store.onLoaded)(function () {
        var user = _store.store.getState().user.user;

        if (user) {
            replace({
                pathname: '/',
                state: { nextPathname: nextState.location.pathname }
            });
        }
        done();
    });
}
function checkInviteToken(nextState, replace) {
    var token = nextState.location.query.token;

    console.log('token', token);
    if (!token) {
        replace({
            pathname: '/register',
            state: Object.assign({}, nextState, { location: Object.assign({}, nextState.location, { query: {} }) })
        });
    } else {
        _store.store.dispatch((0, _auth.getInvite)(token));
    }
}
function loadPageData(nextState) {
    _store.store.dispatch((0, _insights.getPageInsights)(nextState.params.pageId));
}
function loadMarketingData() {
    console.log('load marketing data!!!');
    _store.store.dispatch((0, _campaigns.getCampaignInsights)());
}
var App = exports.App = function App() {
    return React.createElement(_reactRedux.Provider, { store: _store.store }, React.createElement(_reactRouter.Router, { history: _environment.history }, React.createElement(_reactRouter.Route, { path: '/sign-in', component: _signIn.SignIn, onEnter: requireNotAuth }), React.createElement(_reactRouter.Route, { path: '/register', component: _register.Register, onEnter: requireNotAuth }), React.createElement(_reactRouter.Route, { path: '/invite', component: _register.RegisterInvite, onEnter: checkInviteToken }), React.createElement(_reactRouter.Route, { path: '/', component: _main.Main, onEnter: requireAuth }, React.createElement(_reactRouter.Route, { path: '/overview', component: _userInfo.UserInfo }), React.createElement(_reactRouter.Route, { path: '/statistics', component: _statistics.Statistics }, React.createElement(_reactRouter.Route, { path: ':pageId', component: _statistics.Statistics, onEnter: loadPageData })), React.createElement(_reactRouter.Route, { path: '/ads', component: _campaignStatistics.CampaignStatistics, onEnter: loadMarketingData }), React.createElement(_reactRouter.Route, { path: '/account', component: _userInfo.UserInfo }))));
};
//# sourceMappingURL=app.js.map
