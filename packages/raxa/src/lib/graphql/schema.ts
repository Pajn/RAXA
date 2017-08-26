import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import {PubSub} from 'graphql-subscriptions'
import {deviceMutations, deviceQueries, deviceSubscriptions} from './device'
import {deviceClassQueries} from './device-class'
import {interfaceQueries} from './interface'
import {pluginMutations, pluginQueries} from './plugin'

export const pubsub = new PubSub()

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    ...deviceQueries,
    ...deviceClassQueries,
    ...interfaceQueries,
    ...pluginQueries,
  }),
})

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...deviceMutations,
    ...pluginMutations,
  }),
})

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {...deviceSubscriptions},
})

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
})
