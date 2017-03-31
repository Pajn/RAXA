'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CampaignStatistics = undefined;

var _reactRedux = require('react-redux');

var _dashboard = require('dashboard/dashboard');

var _entities = require('dashboard/lib/entities');

var _campaigns = require('../widgets/campaigns');

var widgetTypes = {
    Campaigns: _campaigns.Campaigns,
    NumberType: _entities.NumberType
};
var chartTypes = {};
var styles = require('./statistics.scss');
var configuration = {
    name: 'Dashboard',
    applicationId: 'as',
    widget: {
        type: _entities.LayoutWidget.verticalList,
        widgets: [{
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: _entities.DataWidget.number,
                title: 'Totalt spenderad budget',
                bucket: 'spend',
                background: 'light-blue',
                isDark: true,
                typeConfiguration: {
                    type: _entities.NumberType.sum,
                    numberColor: 'white',
                    unit: 'kr',
                    unitColor: 'white',
                    decimalPlaces: 3
                }
            }, {
                type: _entities.DataWidget.number,
                title: 'CTR',
                bucket: 'ctr',
                background: 'purple',
                isDark: true,
                typeConfiguration: {
                    type: _entities.NumberType.sum,
                    numberColor: 'white',
                    decimalPlaces: 3
                }
            }, {
                type: _entities.DataWidget.number,
                title: 'CPC',
                bucket: 'cpc',
                background: 'light-blue',
                isDark: true,
                typeConfiguration: {
                    type: _entities.NumberType.sum,
                    numberColor: 'white',
                    decimalPlaces: 3
                }
            }, {
                type: _entities.DataWidget.number,
                title: 'CPM',
                bucket: 'cpm',
                background: 'purple',
                isDark: true,
                typeConfiguration: {
                    type: _entities.NumberType.sum,
                    numberColor: 'white',
                    decimalPlaces: 3
                }
            }]
        }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: 'Campaigns'
            }]
        }]
    }
};
var CampaignStatistics = exports.CampaignStatistics = (0, _reactRedux.connect)(function (state) {
    return { buckets: state.buckets || {} };
})(function (_ref) {
    var buckets = _ref.buckets;

    return React.createElement("div", { className: styles.statistics }, React.createElement(_dashboard.Dashboard, Object.assign({}, { buckets: buckets, configuration: configuration, chartTypes: chartTypes, widgetTypes: widgetTypes })));
});
//# sourceMappingURL=campaign-statistics.js.map
