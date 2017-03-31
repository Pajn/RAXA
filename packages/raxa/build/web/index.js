'use strict';

var _dialog = require('dashboard/dialog');

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _reactDom = require('react-dom');

var _app = require('./app');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

require('./style/definitions.scss');
require('dashboard/style/defaults.global.scss');
require('react-mdl/extra/material.css');
require('react-mdl/extra/material.js');
function renderApp(App) {
    var app = document.getElementById('app');
    var dialog = document.getElementById('dialog');
    if (module.hot) {
        var RedBox = require('redbox-react');
        try {
            (0, _reactDom.render)(React.createElement(App, null), app);
        } catch (error) {
            error.stack = error.stack.replace(/http:\/\/localhost:3000\/webpack:/g, __ROOT_PATH__).replace(/~/, 'node_modules').replace(/\?[0-9a-z]+:/g, ':');
            (0, _reactDom.render)(React.createElement(RedBox, { error: error, editorScheme: 'code' }), app);
        }
    } else {
        (0, _reactDom.render)(React.createElement(App, null), app);
    }
    (0, _reactDom.render)(React.createElement(_dialog.DialogContainer, null), dialog);
}
if (window.document) {
    window.React = React;
    renderApp(_app.App);
}
if (module.hot) {
    module.hot.accept('./app', function () {
        var UpdatedApp = require('./app').App;
        setTimeout(function () {
            return renderApp(UpdatedApp);
        });
    });
}
//# sourceMappingURL=index.js.map
