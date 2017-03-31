'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.classNames = classNames;
exports.date = date;
exports.daysDiff = daysDiff;
function classNames() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
        names[_key] = arguments[_key];
    }

    return names.filter(function (name) {
        return !!name;
    }).join(' ');
}
function date(daysAgo) {
    var date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    if (daysAgo) {
        date.setDate(date.getDate() - daysAgo);
    }
    return date.getTime();
}
function daysDiff(from, to) {
    if (from instanceof Date) from = from.getTime();
    if (to instanceof Date) to = to.getTime();
    return Math.round((to - from) / 1000 / 60 / 60 / 24);
}
//# sourceMappingURL=helpers.js.map
