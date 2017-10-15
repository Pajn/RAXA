import {ApolloClient, createNetworkInterface, gql} from 'react-apollo'
import {combineReducers, createStore} from 'redux'
import {
  SubscriptionClient,
  addGraphQLSubscriptions,
} from 'subscriptions-transport-ws'
import {snackbarReducer} from '../redux-snackbar/reducer'

const ssl = location.protocol === 'https:'
const port = ssl ? 9001 : 9000

const wsClient = new SubscriptionClient(
  `${ssl ? 'wss' : 'ws'}://${location.hostname}:${port}/subscriptions`,
  {
    reconnect: true,
  },
)

const networkInterface = createNetworkInterface({
  uri: `${ssl ? 'https' : 'http'}://${location.hostname}:${port}/graphql`,
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
  snackbar: snackbarReducer,
} as any)

export const store = createStore(reducer)

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
