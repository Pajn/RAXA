import MuiOldThemeProvider from 'material-ui-old/styles/MuiThemeProvider'
import getMuiOldTheme from 'material-ui-old/styles/getMuiTheme'
import {purple, teal} from 'material-ui/colors'
import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles'
import React from 'react'
import {ApolloProvider} from 'react-apollo'
import {Scaffold} from 'react-material-app'
import {Provider} from 'react-redux'
import {Route} from 'react-router'
import {BrowserRouter} from 'react-router-dom'
import {Settings} from './components/settings/settings'
import {Ui2} from './components/ui2/main'
import {client, store} from './lib/store'
import {ReduxSnackbar} from './redux-snackbar/redux-snackbar'

const theme = createMuiTheme({
  palette: {
    primary: {
      light: purple[100],
      main: purple[500],
      dark: purple[700],
      contrastText: '#fff',
    },
    secondary: {
      light: teal[100],
      main: teal[500],
      dark: teal[700],
      contrastText: '#fff',
    },
  },
})

const oldTheme = getMuiOldTheme({
  palette: {
    primary3Color: purple[100],
    primary1Color: purple[500],
    primary2Color: purple[700],
    accent1Color: teal[100],
    accent2Color: teal[500],
    accent3Color: teal[700],
  },
})

export const App = () => (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <MuiOldThemeProvider theme={oldTheme}>
        <MuiThemeProvider theme={theme}>
          <BrowserRouter>
            <Scaffold appName="Raxa">
              <Route exact path="/" component={Ui2} />
              <Route path="/settings" component={Settings} />
              <ReduxSnackbar />
            </Scaffold>
          </BrowserRouter>
        </MuiThemeProvider>
      </MuiOldThemeProvider>
    </Provider>
  </ApolloProvider>
)
