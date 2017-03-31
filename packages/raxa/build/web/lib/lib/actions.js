'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.actions = undefined;
exports.action = action;

var _reduxDecorated = require('redux-decorated');

var actions = exports.actions = (0, _reduxDecorated.createActions)({
    inviteUpdate: {},
    loadingSelectabePages: {},
    loadedSelectabePages: {},
    selectAd: {},
    setGlobalPeriod: {},
    setSelectablePageActive: {},
    signIn: {},
    signInFail: {},
    signOut: {},
    updateBucket: {},
    updateCampaigns: {},
    updatePages: {},
    updateSelectablePages: {},
    updateUser: {},
    updateMenuItems: {}
});
function action(action, payload) {
    return {
        type: action.type,
        payload: payload
    };
}
//# sourceMappingURL=actions.js.map
