'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.interfaceQueries = exports.InterfaceType = undefined;

var _graphql = require('graphql');

var _graphqlTypeJson = require('graphql-type-json');

var _graphqlTypeJson2 = _interopRequireDefault(_graphqlTypeJson);

var _graphqlVerified = require('graphql-verified');

var _joi = require('joi');

var joi = _interopRequireWildcard(_joi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var InterfaceType = exports.InterfaceType = (0, _graphqlVerified.buildType)({
    name: 'Interface',
    fields: {
        id: { type: _graphql.GraphQLString },
        pluginId: { type: _graphql.GraphQLString },
        methods: { type: _graphqlTypeJson2.default },
        status: { type: _graphqlTypeJson2.default }
    },
    readRules: false,
    writeRules: false
});
var interfaceQueries = exports.interfaceQueries = (0, _graphqlVerified.buildQueries)({
    interfaces: {
        type: [InterfaceType],
        validate: joi.object({}),
        resolve: function resolve(_, _ref, _ref2) {
            var storage = _ref2.storage;

            _objectDestructuringEmpty(_ref);

            return Object.values(storage.getState().interfaces);
        }
    }
});
//# sourceMappingURL=interface.js.map
