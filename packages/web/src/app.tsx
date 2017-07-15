import React from 'react'
import {ApolloProvider} from 'react-apollo'
import {Route} from 'react-router'
import {BrowserRouter} from 'react-router-dom'
import ThemeProvider from 'react-toolbox/lib/ThemeProvider'
import {DeviceSettings} from './components/settings/devices'
import {Scaffold} from './components/ui/scaffold/scaffold'
import {Ui2} from './components/ui2/main'
import {client, store} from './lib/store'
import {ReduxSnackbar} from './redux-snackbar/redux-snackbar'
import theme from './toolbox/theme'
import './toolbox/theme.css'

export const App = () =>
  <ApolloProvider client={client} store={store}>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Scaffold appName="RAXA">
          <Route exact path="/" component={Ui2} />
          <Route path="/settings" component={DeviceSettings} />
          <ReduxSnackbar />
        </Scaffold>
      </BrowserRouter>
    </ThemeProvider>
  </ApolloProvider>