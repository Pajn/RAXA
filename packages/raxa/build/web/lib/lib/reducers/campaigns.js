'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.campaigns = undefined;

var _reduxDecorated = require('redux-decorated');

var _actions = require('../actions');

var campaigns = exports.campaigns = (0, _reduxDecorated.createReducer)({}).when(_actions.actions.updateCampaigns, function (state, campaigns) {
    return campaigns.reduce(function (state, campaign) {
        return (0, _reduxDecorated.updateIn)(campaign.id, campaign, state);
    }, state);
});
//# sourceMappingURL=campaigns.js.map
