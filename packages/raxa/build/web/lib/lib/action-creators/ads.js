'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.selectAd = selectAd;
exports.updateMenuItems = updateMenuItems;

var _actions = require('../actions');

function selectAd(ad) {
    return function (dispatch) {
        dispatch((0, _actions.action)(_actions.actions.selectAd, ad));
    };
}
function updateMenuItems(adItems, activeItem) {
    return function (dispatch) {
        var newAdItems = adItems.map(function (item, i) {
            return Object.assign({}, item, { active: activeItem === i + 1 });
        });
        dispatch((0, _actions.action)(_actions.actions.updateMenuItems, newAdItems));
    };
}
//# sourceMappingURL=ads.js.map
