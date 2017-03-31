'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PeriodPicker = undefined;

var _declarativePattern = require('declarative-pattern');

var _reactMdl = require('react-mdl');

var _reactRedux = require('react-redux');

var _dialog = require('dashboard/dialog');

var _period = require('../lib/action-creators/period');

var _helpers = require('../lib/helpers');

var styles = require('./period-picker.scss');
var dayIntervals = {
    sevenDays: 7,
    thirtyDays: 30,
    threeMonths: 90,
    sixMonths: 180
};
var dateDialog = function dateDialog(dispatch, pageId, period) {
    var from = new Date(period.from).toISOString().substring(0, 10);
    var to = new Date(period.to).toISOString().substring(0, 10);
    var today = new Date().toISOString().substring(0, 10);
    return React.createElement(_dialog.Dialog, { title: 'Välj datum', actions: [React.createElement(_reactMdl.Button, { key: 2, primary: true, form: 'useDateRange' }, 'Anv\xE4nd datum'), React.createElement(_reactMdl.Button, { key: 1, onClick: _dialog.dialog.close }, "Avbryt")] }, React.createElement("form", { id: 'useDateRange', onSubmit: function onSubmit(e) {
            e.preventDefault();
            if (!from || !to) return;
            var dateFrom = new Date(from);
            var dateTo = new Date(to);
            if (dateTo.getTime() < dateFrom.getTime()) {
                var _ref = [dateTo, dateFrom];
                dateFrom = _ref[0];
                dateTo = _ref[1];
            }
            dispatch((0, _period.setGlobalPeriod)(pageId, dateFrom, dateTo));
            return _dialog.dialog.close();
        } }, React.createElement("label", null, 'Datum fr\xE5n'), React.createElement("input", { type: 'date', min: '2006-09-26', max: today, className: styles.dateField, defaultValue: from, onChange: function onChange(e) {
            from = e.target.value;
        } }), React.createElement("label", null, "Datum till"), React.createElement("input", { type: 'date', min: '2006-09-26', max: today, className: styles.dateField, defaultValue: to, onChange: function onChange(e) {
            to = e.target.value;
        } })));
};
var daysToText = (0, _declarativePattern.pattern)().when({ from: (0, _helpers.date)(dayIntervals.threeMonths), to: (0, _helpers.date)() }, 'Senaste 3 månaderna').when({ to: (0, _helpers.date)() }, function (_ref2) {
    var from = _ref2.from,
        to = _ref2.to;
    return 'Senaste ' + (0, _helpers.daysDiff)(from, to) + ' dagarna';
}).default(function (_ref3) {
    var from = _ref3.from,
        to = _ref3.to;
    return new Date(from).toLocaleDateString() + ' - ' + new Date(to).toLocaleDateString();
});
var PeriodPicker = exports.PeriodPicker = (0, _reactRedux.connect)(function (state) {
    return { period: state.period };
})(function (_ref4) {
    var dispatch = _ref4.dispatch,
        pageId = _ref4.pageId,
        period = _ref4.period;
    return pageId ? React.createElement("div", null, React.createElement(_reactMdl.Button, { id: 'period-menu-button' }, daysToText(period), React.createElement(_reactMdl.Icon, { name: 'date_range', className: styles.Icon })), React.createElement(_reactMdl.Menu, { target: 'period-menu-button', align: 'right' }, React.createElement(_reactMdl.MenuItem, { onClick: function onClick() {
            return dispatch((0, _period.setGlobalPeriod)(pageId, dayIntervals.sevenDays));
        } }, "Senaste 7 dagarna"), React.createElement(_reactMdl.MenuItem, { onClick: function onClick() {
            return dispatch((0, _period.setGlobalPeriod)(pageId, dayIntervals.thirtyDays));
        } }, "Senaste 30 dagarna"), React.createElement(_reactMdl.MenuItem, { onClick: function onClick() {
            return dispatch((0, _period.setGlobalPeriod)(pageId, dayIntervals.threeMonths));
        } }, 'Senaste 3 m\xE5naderna'), React.createElement(_reactMdl.MenuItem, { onClick: function onClick() {
            return _dialog.dialog.open(dateDialog(dispatch, pageId, period));
        } }, 'V\xE4lj mellan tv\xE5 datum'))) : null;
});
//# sourceMappingURL=period-picker.js.map
