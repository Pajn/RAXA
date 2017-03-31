import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import {deviceMutations, deviceQueries} from './device'
import {deviceClassQueries} from './device-class'
import {interfaceQueries} from './interface'

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    ...deviceQueries,
    ...deviceClassQueries,
    ...interfaceQueries,
  })
})

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...deviceMutations,
  }),
})

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
})
