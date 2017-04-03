import * as React from 'react'
import {ApolloProvider} from 'react-apollo'
import {client} from './lib/store'
import {DeviceSettings} from './components/settings/devices'

export const App = () =>
  <ApolloProvider client={client}>
    <DeviceSettings />
  </ApolloProvider>
