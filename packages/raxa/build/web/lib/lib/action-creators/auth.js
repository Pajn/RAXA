'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateUser = exports.registerUser = exports.registerInvite = exports.inviteUserUpdated = exports.getInvite = exports.inviteUser = exports.signOut = exports.signedIn = exports.signIn = undefined;

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _actions = require('../actions');

var _pages = require('./pages');

var _environment = require('../environment');

var _http = require('../http');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var signIn = exports.signIn = function signIn(_ref) {
    var email = _ref.email,
        password = _ref.password;
    return function (dispatch) {
        return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee() {
            var response, body, company, user, token;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _http.post)('/auth/login', { email: email, password: password });

                        case 2:
                            response = _context.sent;
                            _context.next = 5;
                            return response.json();

                        case 5:
                            body = _context.sent;
                            company = body.company, user = body.user, token = body.token;

                            if (user && token) {
                                dispatch(signedIn(token, user, company));
                            } else {
                                dispatch((0, _actions.action)(_actions.actions.signInFail));
                            }

                        case 8:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    };
};
var signedIn = exports.signedIn = function signedIn(jwt, user, company) {
    var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
        _ref2$redirect = _ref2.redirect,
        redirect = _ref2$redirect === undefined ? true : _ref2$redirect;

    return function (dispatch) {
        dispatch((0, _actions.action)(_actions.actions.signIn, { token: jwt, user: user, company: company }));
        dispatch((0, _pages.getPages)());
        if (redirect) {
            _environment.history.replace('/');
        }
    };
};
var signOut = exports.signOut = function signOut() {
    return function (dispatch) {
        dispatch(_actions.actions.signOut);
        _environment.history.replace('/sign-in');
    };
};
var inviteUser = exports.inviteUser = function inviteUser(email) {
    return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee2() {
        var response;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return (0, _http.post)('/auth/invite', { user: { email: email } });

                    case 2:
                        response = _context2.sent;

                        console.log(response.status);
                        _context2.t0 = console;
                        _context2.next = 7;
                        return response.json();

                    case 7:
                        _context2.t1 = _context2.sent;

                        _context2.t0.log.call(_context2.t0, _context2.t1);

                    case 9:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
};
var getInvite = exports.getInvite = function getInvite(token) {
    return function (dispatch) {
        return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee3() {
            var response, _ref3, user;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            dispatch((0, _actions.action)(_actions.actions.inviteUpdate, { token: token }));
                            _context3.next = 3;
                            return (0, _http.get)('/auth/invite', {
                                token: token
                            });

                        case 3:
                            response = _context3.sent;
                            _context3.next = 6;
                            return response.json();

                        case 6:
                            _ref3 = _context3.sent;
                            user = _ref3.user;

                            if (user) {
                                dispatch((0, _actions.action)(_actions.actions.inviteUpdate, { user: user }));
                            } else {
                                dispatch((0, _actions.action)(_actions.actions.inviteUpdate, { invalid: true }));
                            }

                        case 9:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));
    };
};
var inviteUserUpdated = exports.inviteUserUpdated = function inviteUserUpdated(user) {
    return function (dispatch) {
        dispatch((0, _actions.action)(_actions.actions.inviteUpdate, { user: user }));
    };
};
var registerInvite = exports.registerInvite = function registerInvite(user) {
    return function (dispatch, getState) {
        return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee4() {
            var response, _ref4, company, registeredUser, token;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            dispatch((0, _actions.action)(_actions.actions.inviteUpdate, { loading: true }));
                            _context4.next = 3;
                            return (0, _http.post)('/auth/register-invite', {
                                token: getState().invite.token,
                                user: user
                            });

                        case 3:
                            response = _context4.sent;
                            _context4.next = 6;
                            return response.json();

                        case 6:
                            _ref4 = _context4.sent;
                            company = _ref4.company;
                            registeredUser = _ref4.user;
                            token = _ref4.token;

                            dispatch((0, _actions.action)(_actions.actions.inviteUpdate, { loading: false }));
                            if (registeredUser) {
                                dispatch(signedIn(token, registeredUser, company));
                            }

                        case 12:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));
    };
};
var registerUser = exports.registerUser = function registerUser(company, user) {
    return function (dispatch) {
        return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee5() {
            var response, _ref5, registeredCompany, registeredUser, token;

            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return (0, _http.post)('/auth/register', { company: company, user: user });

                        case 2:
                            response = _context5.sent;
                            _context5.next = 5;
                            return response.json();

                        case 5:
                            _ref5 = _context5.sent;
                            registeredCompany = _ref5.company;
                            registeredUser = _ref5.user;
                            token = _ref5.token;

                            if (registeredUser) {
                                dispatch(signedIn(token, registeredUser, registeredCompany));
                            }

                        case 10:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));
    };
};
var updateUser = exports.updateUser = function updateUser(_ref6) {
    var company = _ref6.company,
        user = _ref6.user;
    return function (dispatch) {
        return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee6() {
            var response;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            dispatch((0, _actions.action)(_actions.actions.updateUser, { loading: true }));
                            _context6.next = 3;
                            return (0, _http.post)('/user', {
                                company: {
                                    name: company.name,
                                    contactEmail: company.contactEmail,
                                    address: company.address,
                                    phone: company.phone
                                },
                                user: {
                                    name: user.name,
                                    email: user.email,
                                    password: user.password
                                }
                            });

                        case 3:
                            response = _context6.sent;

                            if (!(response.status >= 400)) {
                                _context6.next = 10;
                                break;
                            }

                            _context6.t0 = Error;
                            _context6.next = 8;
                            return response.text();

                        case 8:
                            _context6.t1 = _context6.sent;
                            throw new _context6.t0(_context6.t1);

                        case 10:
                            delete user.password;
                            dispatch((0, _actions.action)(_actions.actions.updateUser, { company: company, user: user, loading: false }));

                        case 12:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));
    };
};
//# sourceMappingURL=auth.js.map
