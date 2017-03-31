'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.schema = undefined;

var _graphql = require('graphql');

var _device = require('./device');

var _deviceClass = require('./device-class');

var _interface = require('./interface');

var QueryType = new _graphql.GraphQLObjectType({
    name: 'Query',
    fields: function fields() {
        return Object.assign({}, _device.deviceQueries, _deviceClass.deviceClassQueries, _interface.interfaceQueries);
    }
});
var MutationType = new _graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: function fields() {
        return Object.assign({}, _device.deviceMutations);
    }
});
var schema = exports.schema = new _graphql.GraphQLSchema({
    query: QueryType,
    mutation: MutationType
});
//# sourceMappingURL=schema.js.map
