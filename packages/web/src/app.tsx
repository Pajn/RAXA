import * as React from 'react'
import {ApolloProvider} from 'react-apollo'
import ThemeProvider from 'react-toolbox/lib/ThemeProvider'
import {DeviceSettings} from './components/settings/devices'
import {Scaffold} from './components/ui/scaffold/scaffold'
import {client} from './lib/store'
import theme from './toolbox/theme'
import './toolbox/theme.css'

export const App = () =>
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <Scaffold appName="RAXA">
        <DeviceSettings />
      </Scaffold>
    </ThemeProvider>
  </ApolloProvider>
