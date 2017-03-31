'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.invite = undefined;

var _reduxDecorated = require('redux-decorated');

var _actions = require('../actions');

var invite = exports.invite = (0, _reduxDecorated.createReducer)({}).when(_actions.actions.inviteUpdate, function (state, newState) {
    if (newState.user) {
        newState.user = Object.assign({}, state.user, newState.user);
    }
    return Object.assign({}, state, newState);
});
//# sourceMappingURL=invite.js.map
