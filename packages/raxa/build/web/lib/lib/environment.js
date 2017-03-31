'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.oauthUrl = exports.domain = exports.history = exports.production = undefined;

var _reactRouter = require('react-router');

var production = exports.production = process.env.NODE_ENV === 'production';
var history = exports.history = production ? _reactRouter.browserHistory : _reactRouter.hashHistory;
var domain = exports.domain = production ? 'http://manager.beanloop.se:7001' : 'http://localhost:7001';
var oauthUrl = exports.oauthUrl = function oauthUrl(service, token) {
    return (production ? '' : 'http://localhost:7001') + '/auth/' + service + '/callback/' + token;
};
//# sourceMappingURL=environment.js.map
