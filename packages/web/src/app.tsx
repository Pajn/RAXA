import {MuiThemeProvider} from '@material-ui/core/styles'
import {ThemeProvider} from 'emotion-theming'
import loadable from 'loadable-components'
import React from 'react'
import ApolloProvider from 'react-apollo/ApolloProvider'
import styled from 'react-emotion'
import {Scaffold} from 'react-material-app/lib/scaffold/Scaffold'
import {Provider} from 'react-redux'
import {Route} from 'react-router'
import {BrowserRouter} from 'react-router-dom'
import {Ui2} from './components/ui2/main'
import {LocalSettingsProvider, localSettingsStore} from './lib/local-settings'
import {client, store} from './lib/store'
import {ReduxSnackbar} from './redux-snackbar'
import {Theme, createTheme} from './theme'

export const LazySettings = loadable(() =>
  import('./components/settings/settings').then(module => module.Settings),
)

const Container = styled('div')<{}, Theme>(({theme}) => ({
  display: 'flex',
  flex: 1,
  color: theme.background.text,
  backgroundColor: theme.background.main,

  '&>div>div>div': {
    display: 'flex',
  },
}))

export const App = () => (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <LocalSettingsProvider store={localSettingsStore}>
        {({theme: themeName}) => {
          const {muiTheme, theme} = createTheme(themeName)

          return (
            <MuiThemeProvider theme={muiTheme}>
              <ThemeProvider theme={theme}>
                <BrowserRouter>
                  <Container>
                    <Scaffold appName="Raxa">
                      <Route exact path="/" component={Ui2} />
                      <Route path="/settings" component={LazySettings} />
                      <ReduxSnackbar />
                    </Scaffold>
                  </Container>
                </BrowserRouter>
              </ThemeProvider>
            </MuiThemeProvider>
          )
        }}
      </LocalSettingsProvider>
    </Provider>
  </ApolloProvider>
)
