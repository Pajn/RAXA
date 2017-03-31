'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('/home/rasmus/Development/RAXA/packages/raxa/node_modules/babel-preset-react-app/node_modules/babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getPages = getPages;
exports.getSelectablePages = getSelectablePages;
exports.setActive = setActive;
exports.updatePages = updatePages;

var _actions = require('../actions');

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
function getPages() {
    var _this = this;

    return function (dispatch) {
        return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee() {
            var response, _ref, pages;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _http.get)('/pages');

                        case 2:
                            response = _context.sent;
                            _context.next = 5;
                            return response.json();

                        case 5:
                            _ref = _context.sent;
                            pages = _ref.pages;

                            pages.length && dispatch((0, _actions.action)(_actions.actions.updatePages, pages));

                        case 8:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    };
}
function getSelectablePages(network) {
    var _this2 = this;

    return function (dispatch, getState) {
        return __awaiter(_this2, void 0, void 0, _regenerator2.default.mark(function _callee2() {
            var response, pages;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!getState().selectablePages._loading[network]) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return');

                        case 2:
                            dispatch((0, _actions.action)(_actions.actions.loadingSelectabePages, network));
                            _context2.next = 5;
                            return (0, _http.get)('/pages/' + network);

                        case 5:
                            response = _context2.sent;
                            _context2.next = 8;
                            return response.json();

                        case 8:
                            pages = _context2.sent;

                            dispatch((0, _actions.action)(_actions.actions.updateSelectablePages, { network: network, pages: pages }));
                            dispatch((0, _actions.action)(_actions.actions.loadedSelectabePages, network));

                        case 11:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
    };
}
function setActive(network, page, active) {
    return (0, _actions.action)(_actions.actions.setSelectablePageActive, { network: network, pageId: page.id, active: active });
}
function updatePages() {
    var _this3 = this;

    return function (dispatch, getState) {
        return __awaiter(_this3, void 0, void 0, _regenerator2.default.mark(function _callee3() {
            var pages, response;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            dispatch((0, _actions.action)(_actions.actions.loadingSelectabePages, '_update'));
                            pages = {};

                            Object.entries(getState().selectablePages).forEach(function (_ref2) {
                                var _ref3 = _slicedToArray(_ref2, 2),
                                    network = _ref3[0],
                                    selectablePages = _ref3[1];

                                if (network === '_loading') return false;
                                Object.values(selectablePages).forEach(function (page) {
                                    if (page.active) {
                                        pages[page.id] = Object.assign({}, page, { network: network });
                                    }
                                });
                            });
                            _context3.next = 5;
                            return (0, _http.post)('/pages', { pages: Object.values(pages) });

                        case 5:
                            response = _context3.sent;

                            if (!(response.status >= 400)) {
                                _context3.next = 12;
                                break;
                            }

                            _context3.t0 = Error;
                            _context3.next = 10;
                            return response.text();

                        case 10:
                            _context3.t1 = _context3.sent;
                            throw new _context3.t0(_context3.t1);

                        case 12:
                            dispatch((0, _actions.action)(_actions.actions.loadedSelectabePages, '_update'));
                            dispatch((0, _actions.action)(_actions.actions.updatePages, Object.values(pages)));

                        case 14:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));
    };
}
//# sourceMappingURL=pages.js.map
