'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StartupGuide = exports.Loading = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _reactMdl = require('react-mdl');

var _reactRedux = require('react-redux');

var _guide = require('dashboard/components/guide');

var _spinner = require('dashboard/components/spinner');

var _formHelper = require('./form-helper');

var _socialButton = require('./social-button');

var _auth = require('../lib/action-creators/auth');

var _pages = require('../lib/action-creators/pages');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = require('./startup-guide.scss');
var InformationVideo = function InformationVideo() {
    return React.createElement("div", null, "Info!");
};
var UserInformation = function UserInformation(_ref) {
    var state = _ref.state,
        setState = _ref.setState;
    var _state$user = state.user,
        user = _state$user === undefined ? { user: {}, company: {} } : _state$user;

    return React.createElement("div", { className: styles.row }, React.createElement("div", null, React.createElement(_formHelper.FormHelper, { object: user, onUpdate: function onUpdate(user) {
            return setState(Object.assign({}, state, { user: user }));
        }, fields: [React.createElement("h3", null, 'F\xF6retagsuppgifter'), { label: 'Företagsnamn', path: ['company', 'name'], required: true }, { label: 'Epost address', path: ['company', 'contactEmail'], type: 'email', required: true }, { label: 'Telefonnummer', path: ['company', 'phone'], required: true }, { label: 'Gatuadress', path: ['company', 'address'], required: true }] })), React.createElement("div", null, React.createElement(_formHelper.FormHelper, { object: user, onUpdate: function onUpdate(user) {
            return setState(Object.assign({}, state, { user: user }));
        }, fields: [React.createElement("h3", null, "Inloggningsuppgifter"), { label: 'Namn', path: ['user', 'name'], required: true }, { label: 'Epost address', path: ['user', 'email'], type: 'email', required: true }, { label: 'Lösenord', path: ['user', 'password'], type: 'password' }] })));
};
var SelectPages = function SelectPages(_ref2) {
    var pages = _ref2.pages,
        setActive = _ref2.setActive;
    return React.createElement("div", { className: styles.pageList }, Object.values(pages || {}).map(function (page) {
        return React.createElement("div", { key: page.id, className: styles.page }, React.createElement("img", { src: page.image }), React.createElement("span", null, page.name), page.active ? React.createElement(_reactMdl.Button, { onClick: setActive(page, false), ripple: true }, "Checked") : React.createElement(_reactMdl.Button, { onClick: setActive(page, true), ripple: true }, 'L\xE4gg till'));
    }));
};
var AddAcounts = (0, _reactRedux.connect)(function (state) {
    return { user: state.user.user, selectablePages: state.selectablePages };
})(function (_Component) {
    _inherits(_class, _Component);

    function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _props = this.props,
                dispatch = _props.dispatch,
                selectablePages = _props.selectablePages,
                user = _props.user;

            var _ref3 = user.networks || {},
                facebook = _ref3.facebook,
                instagram = _ref3.instagram;

            if (facebook && !selectablePages.facebook) {
                dispatch((0, _pages.getSelectablePages)('facebook'));
            }
            if (instagram && !selectablePages.instagram) {
                dispatch((0, _pages.getSelectablePages)('instagram'));
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props,
                dispatch = _props2.dispatch,
                selectablePages = _props2.selectablePages,
                user = _props2.user;

            var _ref4 = user.networks || {},
                facebook = _ref4.facebook,
                instagram = _ref4.instagram;

            return React.createElement("div", null, React.createElement("p", null, 'Du kan alltid l\xE4gga till fler konton seenare under fliken mina sidor i inst\xE4llningar'), React.createElement("div", { className: styles.row }, React.createElement("div", { className: styles.flex }, React.createElement("h3", null, "Facebook"), facebook ? React.createElement(SelectPages, { pages: selectablePages.facebook, setActive: function setActive(page, active) {
                    return function () {
                        return dispatch((0, _pages.setActive)('facebook', page, active));
                    };
                } }) : React.createElement(_socialButton.SocialButton, { network: 'facebook' })), React.createElement("div", { className: styles.flex }, React.createElement("h3", null, "Instagram"), instagram ? React.createElement(SelectPages, { pages: selectablePages.instagram, setActive: function setActive(page, active) {
                    return function () {
                        return dispatch((0, _pages.setActive)('instagram', page, active));
                    };
                } }) : React.createElement(_socialButton.SocialButton, { network: 'instagram' }))));
        }
    }]);

    return _class;
}(_react.Component));
var Done = function Done(_ref5) {
    var user = _ref5.state.user;
    return React.createElement("div", null, React.createElement("h2", null, 'D\xE5 var det klart!'), React.createElement("h3", null, 'Nu \xE4r du redo att se all din statistik i ett och samma verktyg!'), React.createElement("div", { className: styles.row }, React.createElement("div", null, React.createElement("p", null, "Din testperiod varar i 30 dagar. Vi kommer sedan att kontakta dig"), React.createElement("p", null, 'Vill du ha en kostnadsfri presentation om vad SocialView kan g\xF6ra f\xF6r dig?', React.createElement("span", { style: { textAlign: 'center' } }, "Kontakta mig"))), React.createElement("div", null, React.createElement("p", null, 'Ditt anv\xE4ndarnamn:', React.createElement("span", null, user.email)))));
};
var Loading = exports.Loading = function Loading() {
    return React.createElement("div", { className: styles.loading }, React.createElement(_spinner.Spinner, { size: 40 }));
};
var StartupGuide = exports.StartupGuide = (0, _reactRedux.connect)(function (state) {
    return { loading: state.selectablePages._loading._update || state.user.loading };
})(function (_ref6) {
    var dispatch = _ref6.dispatch,
        loading = _ref6.loading;
    return React.createElement(_guide.Guide, { allowDismiss: false, onDone: function onDone(state) {
            dispatch((0, _pages.updatePages)());
            dispatch((0, _auth.updateUser)(state.user));
            return false;
        }, pages: [{
            title: '',
            component: InformationVideo
        }, {
            title: 'Lägg till dina inloggningsuppgifter',
            component: UserInformation
        }, {
            title: 'Hantera alla dina konton i samma verktyg - lägg till konto nedan',
            component: AddAcounts
        }, {
            component: loading ? Loading : Done,
            allowIf: function allowIf(_ref7) {
                var user = _ref7.user;
                return !!user;
            },
            disallowReason: 'Du måste fylla i alla obligatoriska fält i guiden innan du går vidare'
        }] });
});
//# sourceMappingURL=startup-guide.js.map
