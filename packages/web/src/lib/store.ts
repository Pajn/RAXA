import {InMemoryCache} from 'apollo-cache-inmemory'
import {ApolloClient} from 'apollo-client'
import {ApolloLink, split} from 'apollo-link'
import {BatchHttpLink} from 'apollo-link-batch-http'
import {onError} from 'apollo-link-error'
import {WebSocketLink} from 'apollo-link-ws'
import {getMainDefinition} from 'apollo-utilities'
import {toIdValue} from 'apollo-utilities'
import {OperationDefinitionNode} from 'graphql'
import gql from 'graphql-tag'
import {combineReducers, compose, createStore} from 'redux'
import {autoRehydrate, persistStore} from 'redux-persist'
import {reducer as mainScreenReducer} from '../components/ui2/main'
import {snackbarReducer} from '../redux-snackbar'

const ssl = location.protocol === 'https:'
const port =
  process.env.NODE_ENV === 'production'
    ? location.port && `:${location.port}`
    : `:${ssl ? 9001 : 9000}`

const host = localStorage.getItem('debug:host') || `${location.hostname}${port}`

export const baseHttpUrl = `${ssl ? 'https' : 'http'}://${host}`

// Create an http link:
const httpLink = new BatchHttpLink({
  uri: `${baseHttpUrl}/graphql`,
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `${ssl ? 'wss' : 'ws'}://${host}/subscriptions`,
  options: {
    reconnect: true,
  },
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({query}) => {
    const {kind, operation} = getMainDefinition(
      query,
    ) as OperationDefinitionNode
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      device: (_, args) =>
        toIdValue(
          cache.config.dataIdFromObject({__typename: 'Device', id: args.id}),
        ),
    },
  },
})

export const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({graphQLErrors, networkError}) => {
      if (graphQLErrors)
        graphQLErrors.map(({message, locations, path}) =>
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        )
      if (networkError) console.error(`[Network error]: ${networkError}`)
    }),
    link,
  ]),
  cache,
})

const reducer = combineReducers({
  mainScreen: mainScreenReducer,
  snackbar: snackbarReducer,
} as any)

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(reducer, {}, composeEnhancers(autoRehydrate()))

persistStore(store, {
  whitelist: ['mainScreen'],
})

// Subscribe to all status updates, Apollo will automatically update the store using the id.
client
  .subscribe({
    query: gql`
      subscription deviceUpdated {
        deviceUpdated {
          id
          name
          config
        }
      }
    `,
  })
  .subscribe({})
client
  .subscribe({
    query: gql`
      subscription deviceStatusUpdated {
        deviceStatusUpdated {
          id
          value
        }
      }
    `,
  })
  .subscribe({})
