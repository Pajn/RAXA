import * as React from 'react'
import {ApolloProvider} from 'react-apollo'
import ThemeProvider from 'react-toolbox/lib/ThemeProvider'
import {client} from './lib/store'
import {DeviceSettings} from './components/settings/devices'
import './toolbox/theme.css'
import theme from './toolbox/theme'

export const App = () =>
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <DeviceSettings />
    </ThemeProvider>
  </ApolloProvider>
