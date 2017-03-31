'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Statistics = undefined;

var _reactRedux = require('react-redux');

var _dashboard = require('dashboard/dashboard');

var _entities = require('dashboard/lib/entities');

var _ageGenderChart = require('../charts/age-gender-chart');

var _reactionChart = require('../charts/reaction-chart');

var _topPosts = require('../widgets/top-posts');

var widgetTypes = {
    TopPosts: _topPosts.TopPosts
};
var chartTypes = {
    AgeGenderChart: _ageGenderChart.AgeGenderChart,
    ReactionChart: _reactionChart.ReactionChart
};
var styles = require('./statistics.scss');
var configuration = {
    name: 'Dashboard',
    applicationId: 'as',
    widget: {
        type: _entities.LayoutWidget.verticalList,
        widgets: [{
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: _entities.DataWidget.map,
                title: 'Unika sidvisningar efter stad',
                bucket: 'page_impressions_by_city_unique'
            }]
        }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: _entities.DataWidget.chart,
                title: 'Reaktioner',
                bucket: 'page_actions_post_reactions_total',
                typeConfiguration: {
                    chartType: 'ReactionChart'
                }
            }]
        }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: _entities.DataWidget.chart,
                title: 'Totala klick denna månad',
                bucket: 'page_consumptions',
                description: 'Fugiat duis irure officia culpa culpa enim tempor duis qui proident eiusmod.\n\nReprehenderit consectetur excepteur sit culpa. Aliquip anim ipsum Lorem dolor enim. Ea et qui consectetur cillum nulla Lorem proident ex incididunt cillum. Anim est mollit duis velit aliquip eu ad Lorem sint do. Ipsum id aute nisi aliquip Lorem ad aliquip. In eu est quis in eu pariatur consequat minim reprehenderit laboris ad consectetur dolor.',
                typeConfiguration: {
                    chartType: _entities.ChartType.line,
                    allowNegativeValues: false,
                    fill: true,
                    smooth: false,
                    stack: false,
                    xAxis: { type: _entities.AxisType.timestamp },
                    yAxis: { type: _entities.AxisType.value },
                    colors: ['amber']
                }
            }, {
                type: _entities.DataWidget.chart,
                title: 'Dagliga organiska visningar',
                bucket: 'page_impressions_organic',
                typeConfiguration: {
                    chartType: _entities.ChartType.line,
                    allowNegativeValues: false,
                    fill: true,
                    smooth: false,
                    stack: false,
                    colors: ['green']
                }
            }]
        }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: _entities.DataWidget.chart,
                title: 'Antal personer som har slutat gilla',
                bucket: 'page_fan_removes',
                typeConfiguration: {
                    chartType: _entities.ChartType.line,
                    allowNegativeValues: false,
                    fill: true,
                    smooth: false,
                    stack: false,
                    colors: ['red']
                }
            }, {
                type: _entities.DataWidget.chart,
                title: 'Engagemang i antal klick och stories',
                bucket: 'page_engaged_users',
                typeConfiguration: {
                    chartType: _entities.ChartType.line,
                    allowNegativeValues: false,
                    fill: true,
                    smooth: false,
                    stack: false,
                    colors: ['cyan']
                }
            }]
        }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: _entities.DataWidget.chart,
                title: 'Personer du når ut till',
                bucket: 'page_impressions_by_age_gender_unique',
                typeConfiguration: {
                    chartType: 'AgeGenderChart'
                }
            }]
        }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: _entities.DataWidget.chart,
                title: 'Feedback',
                bucket: 'page_positive_feedback_by_type',
                minHeight: 500,
                typeConfiguration: {
                    chartType: _entities.ChartType.twoDimensionalLine,
                    positive: [{ bucket: 'page_positive_feedback_by_type', accessors: ['rsvp', 'link', 'like', 'comment', 'claim', 'answer'] }],
                    negative: [{ bucket: 'page_negative_feedback_by_type', accessors: ['hide_all_clicks', 'hide_clicks', 'unlike_page_clicks', 'report_spam_clicks', 'xbutton_clicks'] }],
                    legend: {
                        positive: ['rsvp', 'Länkar', 'Likes', 'Kommentarer', 'claim', 'answer'],
                        negative: ['Dölj alla klick', 'Dölj inlägg klick', 'Ogillningar', 'Anmält som spam', 'X-knapp klick']
                    },
                    fill: true,
                    smooth: false
                }
            }]
        }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: _entities.DataWidget.chart,
                title: 'Dagliga organiska visningar',
                bucket: 'page_impressions_organic',
                typeConfiguration: {
                    chartType: _entities.ChartType.bar
                }
            }]
        }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{
                type: 'TopPosts',
                bucket: 'promotable_posts'
            }]
        }]
    }
};
var Statistics = exports.Statistics = (0, _reactRedux.connect)(function (state) {
    return { buckets: state.buckets || {} };
})(function (_ref) {
    var buckets = _ref.buckets;
    return React.createElement("div", { className: styles.statistics }, React.createElement(_dashboard.Dashboard, Object.assign({}, { buckets: buckets, configuration: configuration, chartTypes: chartTypes, widgetTypes: widgetTypes })));
});
//# sourceMappingURL=statistics.js.map
