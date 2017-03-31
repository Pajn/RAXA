'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.menu = undefined;

var _reduxDecorated = require('redux-decorated');

var _actions = require('../actions');

var menu = exports.menu = (0, _reduxDecorated.createReducer)({}).when(_actions.actions.updateMenuItems, function (state, newState) {
    return newState;
});
//# sourceMappingURL=menu.js.map
