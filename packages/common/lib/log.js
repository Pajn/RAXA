'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Log = exports.Log = function () {
    function Log(name, parent) {
        _classCallCheck(this, Log);

        this.name = name;
        this.parent = parent;
        this.logger = console;
    }

    _createClass(Log, [{
        key: 'debug',
        value: function debug() {
            var _logger;

            for (var _len = arguments.length, messages = Array(_len), _key = 0; _key < _len; _key++) {
                messages[_key] = arguments[_key];
            }

            (_logger = this.logger).log.apply(_logger, [this.header('debug')].concat(messages));
        }
    }, {
        key: 'info',
        value: function info() {
            var _logger2;

            for (var _len2 = arguments.length, messages = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                messages[_key2] = arguments[_key2];
            }

            (_logger2 = this.logger).info.apply(_logger2, [this.header('info')].concat(messages));
        }
    }, {
        key: 'warn',
        value: function warn() {
            var _logger3;

            for (var _len3 = arguments.length, messages = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                messages[_key3] = arguments[_key3];
            }

            (_logger3 = this.logger).warn.apply(_logger3, [this.header('warn')].concat(messages));
        }
    }, {
        key: 'error',
        value: function error() {
            var _logger4;

            for (var _len4 = arguments.length, messages = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                messages[_key4] = arguments[_key4];
            }

            (_logger4 = this.logger).error.apply(_logger4, [this.header('error')].concat(messages));
        }
    }, {
        key: 'createChild',
        value: function createChild(name) {
            return new Log(name, this);
        }
    }, {
        key: 'header',
        value: function header(level) {
            return new Date().toISOString() + ' ' + this.fullName + ' [' + level + ']:';
        }
    }, {
        key: 'fullName',
        get: function get() {
            if (!this.parent) return this.name;
            return this.parent.fullName + '.' + this.name;
        }
    }]);

    return Log;
}();
//# sourceMappingURL=log.js.map
