import {ApolloClient, createNetworkInterface} from 'react-apollo'

export const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: `http://${window.location.hostname}:9000/graphql`,
  }),
})
