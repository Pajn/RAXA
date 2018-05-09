import glamorous, {ThemeProvider} from 'glamorous'
import {grey} from 'material-definitions'
import MuiOldThemeProvider from 'material-ui-old/styles/MuiThemeProvider'
// import darkBaseTheme from 'material-ui-old/styles/baseThemes/darkBaseTheme'
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

const theme = {
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
}
// const theme = {
//   dark: true,
//   background: {
//     light: '#607D8B',
//     somewhatLight: 'hsl(200, 18%, 43%)',
//     main: '#455A64',
//     dark: '#263238',
//     text: '#fff',
//     textLight: 'rgba(255, 255, 255, 0.7)',
//     textDisabled: 'rgba(255, 255, 255, 0.38)',
//   },
// }

const muiTheme = createMuiTheme({
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

// const muiTheme = createMuiTheme({
//   palette: {
//     type: 'dark',
//     primary: {
//       light: '#B2DFDB',
//       main: '#00796B',
//       dark: '#004D40',
//       contrastText: '#fff',
//     },
//     secondary: {
//       light: '#F8BBD0',
//       main: '#D81B60',
//       dark: '#880E4F',
//       contrastText: '#000',
//     },
//   },
// })

const oldMuiTheme = getMuiOldTheme({
  palette: {
    primary3Color: purple[100],
    primary1Color: purple[500],
    primary2Color: purple[700],
    accent1Color: teal[100],
    accent2Color: teal[500],
    accent3Color: teal[700],
  },
})
// const oldMuiTheme = getMuiOldTheme({
//   ...darkBaseTheme,
//   palette: {
//     ...darkBaseTheme.palette,
//     primary3Color: '#B2DFDB',
//     primary1Color: '#00796B',
//     primary2Color: '#004D40',
//     accent1Color: '#F8BBD0',
//     accent2Color: '#D81B60',
//     accent3Color: '#880E4F',
//   },
// })

const Container = glamorous.div(({theme}: any) => ({
  display: 'flex',
  flex: 1,
  color: theme.background.text,
  backgroundColor: theme.background.main,
}))

export const App = () => (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <MuiOldThemeProvider theme={oldMuiTheme}>
        <MuiThemeProvider theme={muiTheme}>
          <ThemeProvider theme={theme}>
            <BrowserRouter>
              <Container>
                <Scaffold appName="Raxa">
                  <Route exact path="/" component={Ui2} />
                  <Route path="/settings" component={Settings} />
                  <ReduxSnackbar />
                </Scaffold>
              </Container>
            </BrowserRouter>
          </ThemeProvider>
        </MuiThemeProvider>
      </MuiOldThemeProvider>
    </Provider>
  </ApolloProvider>
)
