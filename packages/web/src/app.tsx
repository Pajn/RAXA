import {purple, teal} from '@material-ui/core/colors'
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles'
import glamorous, {ThemeProvider} from 'glamorous'
import {grey} from 'material-definitions'
import React from 'react'
import {ApolloProvider} from 'react-apollo'
import Loadable from 'react-loadable'
import {Scaffold} from 'react-material-app/lib/scaffold/Scaffold'
import {Provider} from 'react-redux'
import {Route} from 'react-router'
import {BrowserRouter} from 'react-router-dom'
import {Ui2} from './components/ui2/main'
import {LocalSettingsProvider, localSettingsStore} from './lib/local-settings'
import {client, store} from './lib/store'
import {ReduxSnackbar} from './redux-snackbar/redux-snackbar'

export const LazySettings = Loadable({
  loader: () =>
    import('./components/settings/settings').then(({Settings}) => Settings),
  loading: () => null,
})

function createTheme(theme: 'white' | 'dark') {
  if (theme === 'white') {
    return {
      theme: {
        dark: false,
        background: {
          light: grey[100],
          somewhatLight: grey[200],
          main: 'white',
          dark: grey[500],
          text: 'rgba(0, 0, 0, 0.87)',
          textLight: 'rgba(0, 0, 0, 0.5)',
          textDisabled: 'rgba(0, 0, 0, 0.3)',
        },
      },
      muiTheme: createMuiTheme({
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
      }),
    }
  } else {
    return {
      theme: {
        dark: true,
        background: {
          light: '#607D8B',
          somewhatLight: 'hsl(200, 18%, 43%)',
          main: '#455A64',
          dark: '#263238',
          text: '#fff',
          textLight: 'rgba(255, 255, 255, 0.7)',
          textDisabled: 'rgba(255, 255, 255, 0.38)',
        },
      },

      muiTheme: createMuiTheme({
        palette: {
          type: 'dark',
          primary: {
            light: '#B2DFDB',
            main: '#00796B',
            dark: '#004D40',
            contrastText: '#fff',
          },
          secondary: {
            light: '#F8BBD0',
            main: '#D81B60',
            dark: '#880E4F',
            contrastText: '#000',
          },
        },
      }),
    }
  }
}

const Container = glamorous.div(({theme}: any) => ({
  display: 'flex',
  flex: 1,
  color: theme.background.text,
  backgroundColor: theme.background.main,
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
