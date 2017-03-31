'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deviceClassQueries = exports.DeviceClassType = undefined;

var _graphql = require('graphql');

var _graphqlTypeJson = require('graphql-type-json');

var _graphqlTypeJson2 = _interopRequireDefault(_graphqlTypeJson);

var _graphqlVerified = require('graphql-verified');

var _joi = require('joi');

var joi = _interopRequireWildcard(_joi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var DeviceClassType = exports.DeviceClassType = (0, _graphqlVerified.buildType)({
    name: 'DeviceClass',
    fields: {
        id: { type: _graphql.GraphQLString },
        pluginId: { type: _graphql.GraphQLString },
        config: { type: _graphqlTypeJson2.default },
        interfaces: { type: [_graphql.GraphQLString] }
    },
    readRules: false,
    writeRules: false
});
var deviceClassQueries = exports.deviceClassQueries = (0, _graphqlVerified.buildQueries)({
    deviceClasses: {
        type: [DeviceClassType],
        validate: joi.object({}),
        resolve: function resolve(_, _ref, _ref2) {
            var storage = _ref2.storage;

            _objectDestructuringEmpty(_ref);

            return Object.values(storage.getState().deviceClasses);
        }
    }
});
//# sourceMappingURL=device-class.js.map
