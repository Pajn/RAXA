'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.user = undefined;

var _reduxDecorated = require('redux-decorated');

var _actions = require('../actions');

var user = exports.user = (0, _reduxDecorated.createReducer)({}).when(_actions.actions.signIn, function (state, _ref) {
    var user = _ref.user,
        company = _ref.company,
        token = _ref.token;
    return Object.assign({ user: user, company: company, token: token, fail: false }, state);
}).when(_actions.actions.signInFail, function (state) {
    return Object.assign({ fail: true }, state);
}).when(_actions.actions.signOut, function () {
    return {};
}).when(_actions.actions.updateUser, function (state, _ref2) {
    var loading = _ref2.loading,
        company = _ref2.company,
        user = _ref2.user;
    return Object.assign({}, state, { loading: loading, company: company || state.company, user: user ? Object.assign({}, state.user, user) : state.user });
});
//# sourceMappingURL=user.js.map
