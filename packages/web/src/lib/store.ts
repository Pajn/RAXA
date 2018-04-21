import {ApolloClient, createNetworkInterface, gql} from 'react-apollo'
import {combineReducers, createStore} from 'redux'
import {autoRehydrate, persistStore} from 'redux-persist'
import {
  SubscriptionClient,
  addGraphQLSubscriptions,
} from 'subscriptions-transport-ws'
import {reducer as mainScreenReducer} from '../components/ui2/main'
import {snackbarReducer} from '../redux-snackbar/reducer'

const ssl = location.protocol === 'https:'
const port =
  process.env.NODE_ENV === 'production'
    ? location.port && `:${location.port}`
    : `:${ssl ? 9001 : 9000}`

const wsClient = new SubscriptionClient(
  `${ssl ? 'wss' : 'ws'}://${location.hostname}${port}/subscriptions`,
  {
    reconnect: true,
  },
)

const networkInterface = createNetworkInterface({
  uri: `${ssl ? 'https' : 'http'}://${location.hostname}${port}/graphql`,
})
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
)

export const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
})

const reducer = combineReducers({
  apollo: client.reducer(),
  mainScreen: mainScreenReducer,
  snackbar: snackbarReducer,
} as any)

export const store = createStore(reducer, {}, autoRehydrate())

persistStore(store)

// Subscribe to all status updates, Apollo will automatically update the store using the id.
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
