'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.period = undefined;

var _reduxDecorated = require('redux-decorated');

var _actions = require('../actions');

var _helpers = require('../helpers');

var period = exports.period = (0, _reduxDecorated.createReducer)({ from: (0, _helpers.date)(30), to: (0, _helpers.date)() }).when(_actions.actions.setGlobalPeriod, function (_, _ref) {
    var from = _ref.from,
        to = _ref.to;
    return { from: from, to: to };
});
//# sourceMappingURL=period.js.map
