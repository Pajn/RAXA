'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setGlobalPeriod = undefined;

var _actions = require('../actions');

var _helpers = require('../helpers');

var _insights = require('./insights');

var setGlobalPeriod = exports.setGlobalPeriod = function setGlobalPeriod(pageId, from) {
    var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _helpers.date)();
    return function (dispatch) {
        from = typeof from === 'number' ? (0, _helpers.date)(from) : from.getTime();
        if (to instanceof Date) {
            to = to.getTime();
        }
        dispatch((0, _actions.action)(_actions.actions.setGlobalPeriod, { from: from, to: to }));
        dispatch((0, _insights.getPageInsights)(pageId));
    };
};
//# sourceMappingURL=period.js.map
