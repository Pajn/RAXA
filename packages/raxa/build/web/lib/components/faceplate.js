"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var styles = require('./faceplate.scss');
var Faceplate = exports.Faceplate = function Faceplate() {
    return React.createElement("div", { className: styles.faceplate }, React.createElement("div", null, React.createElement("div", { className: styles.container }, React.createElement("img", { src: '../assets/logo.png', className: styles.logo }), React.createElement("h2", { className: styles.appName }, "Manager"))));
};
//# sourceMappingURL=faceplate.js.map
