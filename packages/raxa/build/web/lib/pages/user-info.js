'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UserInfo = undefined;

var _dashboard = require('dashboard/dashboard');

var _entities = require('dashboard/lib/entities');

var _myInfo = require('../widgets/my-info');

var _myService = require('../widgets/my-service');

var _socialConnector = require('../widgets/social-connector');

var widgetTypes = {
    MyInfo: _myInfo.MyInfo,
    MyService: _myService.MyService,
    SocialConnector: _socialConnector.SocialConnector
};
var configuration = {
    widget: {
        type: _entities.LayoutWidget.verticalList,
        widgets: [{ type: 'SocialConnector' }, {
            type: _entities.LayoutWidget.horizontalList,
            widgets: [{ type: 'MyInfo' }, { type: 'MyService' }]
        }]
    }
};
var UserInfo = exports.UserInfo = function UserInfo() {
    return React.createElement(_dashboard.Dashboard, { configuration: configuration, widgetTypes: widgetTypes });
};
//# sourceMappingURL=user-info.js.map
