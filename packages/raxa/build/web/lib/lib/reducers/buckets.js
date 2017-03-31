'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buckets = undefined;

var _reduxDecorated = require('redux-decorated');

var _actions = require('../actions');

var buckets = exports.buckets = (0, _reduxDecorated.createReducer)({}).when(_actions.actions.updateBucket, function (_, buckets) {
    return buckets;
});
//# sourceMappingURL=buckets.js.map
