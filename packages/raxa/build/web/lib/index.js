'use strict';

require('babel-polyfill');

var _util = require('util');

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _app = require('./app');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.NODE_ENV !== 'production') {
    require('source-map-support/register');
}

var _require = require('winston/lib/winston/config.js'),
    colorize = _require.colorize;

var time = function time() {
    return new Date().toTimeString();
};
var format = function format(meta) {
    if (!meta) return '';
    return '\n' + (0, _util.inspect)(meta, { colors: true }) + '\n';
};
_winston2.default.remove(_winston2.default.transports.Console);
_winston2.default.add(_winston2.default.transports.Console, {
    formatter: function formatter(_ref) {
        var level = _ref.level,
            message = _ref.message,
            meta = _ref.meta;
        return time() + ' ' + colorize(level) + ': ' + message + format(meta);
    }
});
_winston2.default.level = 'verbose';
(0, _app.main)().catch(function (e) {
    return setImmediate(function () {
        throw e;
    });
});
process.on('unhandledRejection', function (reason, p) {
    _winston2.default.error('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
    console.error(reason);
    console.log(reason && reason.stack);
});
//# sourceMappingURL=index.js.map
