'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.selectablePages = exports.pages = undefined;

var _reduxDecorated = require('redux-decorated');

var _actions = require('../actions');

var pages = exports.pages = (0, _reduxDecorated.createReducer)({}).when(_actions.actions.updatePages, function (state, pages) {
    return pages.reduce(function (state, page) {
        return (0, _reduxDecorated.updateIn)(page.id, page, state);
    }, state);
});
var selectablePages = exports.selectablePages = (0, _reduxDecorated.createReducer)({ _loading: {} }).when(_actions.actions.loadingSelectabePages, function (state, network) {
    return (0, _reduxDecorated.updateIn)(['_loading', network], true, state);
}).when(_actions.actions.loadedSelectabePages, function (state, network) {
    return (0, _reduxDecorated.updateIn)(['_loading', network], false, state);
}).when(_actions.actions.updateSelectablePages, function (state, _ref) {
    var network = _ref.network,
        pages = _ref.pages;
    return (0, _reduxDecorated.updateIn)(network, pages, state);
}).when(_actions.actions.setSelectablePageActive, function (state, _ref2) {
    var network = _ref2.network,
        pageId = _ref2.pageId,
        active = _ref2.active;
    return (0, _reduxDecorated.updateIn)([network, pageId, 'active'], active, state);
});
//# sourceMappingURL=pages.js.map
