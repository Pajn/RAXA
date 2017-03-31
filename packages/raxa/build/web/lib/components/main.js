'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Main = undefined;

var _navigation = require('dashboard/components/navigation');

var _dialog = require('dashboard/dialog');

var _react = require('react');

var _reactMdl = require('react-mdl');

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _auth = require('../lib/action-creators/auth');

var _helpers = require('../lib/helpers');

var _avatar = require('./avatar');

var _companyUsers = require('./company-users');

var _faceplate = require('./faceplate');

var _periodPicker = require('./period-picker');

var styles = require('./main.scss');
var InnerMain = function InnerMain(_ref, _ref2) {
    var children = _ref.children,
        user = _ref.user,
        pages = _ref.pages,
        params = _ref.params,
        dispatch = _ref.dispatch;
    var store = _ref2.store;
    return React.createElement(_reactMdl.Layout, { fixedHeader: true, fixedDrawer: true }, React.createElement(_reactMdl.Header, { title: pages && params.pageId && pages[params.pageId] ? pages[params.pageId].name : 'Manager' }, React.createElement("nav", { className: styles.navBar }, React.createElement(_periodPicker.PeriodPicker, { pageId: params.pageId }), React.createElement("button", { id: 'user-menu-button' }, React.createElement(_avatar.Avatar, null)), React.createElement(_reactMdl.Menu, { target: 'user-menu-button', align: 'right' }, React.createElement(_reactMdl.MenuItem, null, React.createElement(_reactRouter.Link, { to: '/account' }, "Mina sidor")), React.createElement(_reactMdl.MenuItem, { onClick: function onClick() {
            return _dialog.dialog.open(React.createElement(_companyUsers.CompanyUsersDialog, { store: store }));
        } }, 'Bjud in anv\xE4ndare'), React.createElement(_reactMdl.MenuItem, { onClick: function onClick() {
            return dispatch((0, _auth.signOut)());
        } }, "Logga ut")))), React.createElement(_reactMdl.Drawer, null, React.createElement(_faceplate.Faceplate, { user: user, handleSignOut: function handleSignOut() {} }), React.createElement(_navigation.Navigation, null, React.createElement(_reactRouter.Link, { to: '/overview' }, React.createElement(_reactMdl.Icon, { name: 'dashboard' }), '\xD6versikt'), React.createElement(_navigation.ExpandableNavigation, { icon: 'pages', label: 'Sidor', activeRoute: '/statistics' }, Object.values(pages).map(function (page) {
        var isCurrentPage = pages && params.pageId && params.pageId === page.id;
        return React.createElement(_reactRouter.Link, { to: '/statistics/' + page.id, key: page.id, className: (0, _helpers.classNames)(styles.subMenu, isCurrentPage && styles.active) }, React.createElement("img", { src: page.image }), page.name);
    })), React.createElement(_reactRouter.Link, { to: '/ads' }, "Annonsering"), React.createElement("a", { disabled: true }, React.createElement(_reactMdl.Icon, { name: 'public' }), 'Omv\xE4rldsbevakning'), React.createElement("a", { disabled: true }, React.createElement(_reactMdl.Icon, { name: 'help' }), 'Kundtj\xE4nst'))), React.createElement(_reactMdl.Content, null, children));
};
InnerMain.contextTypes = {
    store: _react.PropTypes.object
};
var Main = exports.Main = (0, _reactRedux.connect)(function (state) {
    return {
        user: state.user.user,
        pages: state.pages
    };
})(InnerMain);
//# sourceMappingURL=main.js.map
