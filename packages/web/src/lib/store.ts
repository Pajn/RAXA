import {ApolloClient, createNetworkInterface} from 'react-apollo'
import {combineReducers, createStore} from 'redux'
import {snackbarReducer} from '../redux-snackbar/reducer'

export const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: `http://${window.location.hostname}:9000/graphql`,
  }),
})

const reducer = combineReducers({
  apollo: client.reducer(),
  snackbar: snackbarReducer,
})

export const store = createStore(reducer)
