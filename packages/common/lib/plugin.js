'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Plugin = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _service = require('./service');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = exports.Plugin = function (_Service) {
  _inherits(Plugin, _Service);

  function Plugin() {
    _classCallCheck(this, Plugin);

    return _possibleConstructorReturn(this, (Plugin.__proto__ || Object.getPrototypeOf(Plugin)).apply(this, arguments));
  }

  _createClass(Plugin, [{
    key: 'onDeviceCreated',

    /**
     * Called when a device is being created from one of the plugins DeviceClasses
     * Throw to abort the creation, return an updated device to alter its
     * configuration or return undefined to don't do anything at all.
     * If a Promise is returned then RAXA will wait for it to be resolved.
     */
    value: function onDeviceCreated(device) {}
    /**
     * Called when a device owned by the plugin is beeing called.
     * Throw to notify an error, return an updated device to alter its
     * configuration or return undefined to don't do anything at all.
     * If a Promise is returned then RAXA will wait for it to be resolved.
     */

  }, {
    key: 'onDeviceCalled',
    value: function onDeviceCalled(call, device) {}
  }, {
    key: 'onDeviceStatusModified',
    value: function onDeviceStatusModified(modification, device) {}
  }]);

  return Plugin;
}(_service.Service);
//# sourceMappingURL=plugin.js.map
