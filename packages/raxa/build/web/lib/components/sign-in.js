'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SignIn = undefined;

var _reactMdl = require('react-mdl');

var _reactRedux = require('react-redux');

var _auth = require('../lib/action-creators/auth');

var _formHelper = require('./form-helper');

var styles = require('./sign-in.scss');
var production = process.env.NODE_ENV === 'production';
var oauthUrl = function oauthUrl(service) {
    return (production ? '' : 'http://localhost:7001') + '/auth/' + service + '/callback';
};
var SignIn = exports.SignIn = (0, _reactRedux.connect)(function (state) {
    return { fail: state.user.fail };
})(function (_ref) {
    var fail = _ref.fail,
        dispatch = _ref.dispatch;
    return React.createElement("div", { className: styles.back }, React.createElement("div", { className: styles.logo }, React.createElement("img", { src: 'assets/logo.png', className: styles.logo }), React.createElement("h1", null, "Manager")), React.createElement("div", { className: styles.box }, React.createElement(_formHelper.FormHelper, { saveButton: 'Logga in', object: {}, onSave: function onSave(credentials) {
            return dispatch((0, _auth.signIn)(credentials));
        }, fields: [fail && React.createElement("p", null, 'Felaktigt anv\xE4ndarnamn och/eller l\xF6senord'), { label: 'Epost', path: ['email'], type: 'email' }, { label: 'Lösenord', path: ['password'], type: 'password' }] }), React.createElement("form", { onSubmit: function onSubmit(e) {
            e.preventDefault();
        } }, React.createElement("p", null, "Eller logga in med"), React.createElement("div", { className: styles.buttons }, React.createElement(_reactMdl.Button, { href: oauthUrl('facebook'), primary: true, ripple: true, raised: true }, "Facebook")))), React.createElement("div", { className: styles.details }, "Privacy policy"));
});
//# sourceMappingURL=sign-in.js.map
