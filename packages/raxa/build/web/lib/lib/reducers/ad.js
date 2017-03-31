'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ad = undefined;

var _reduxDecorated = require('redux-decorated');

var _actions = require('../actions');

var ad = exports.ad = (0, _reduxDecorated.createReducer)({}).when(_actions.actions.selectAd, function (state, newState) {
    if (newState.ad) {
        newState.ad = Object.assign({}, newState.ad);
    }
    return Object.assign({}, state, newState);
});
//# sourceMappingURL=ad.js.map
