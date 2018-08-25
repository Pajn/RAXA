import {purple, teal} from '@material-ui/core/colors'
import {Theme as MuiTheme, createMuiTheme} from '@material-ui/core/styles'
import {grey} from 'material-definitions'

export type Theme = {
  dark: boolean
  background: {
    light: string
    somewhatLight: string
    main: string
    dark: string
    text: string
    textLight: string
    textDisabled: string
  }
}

export function createTheme(
  theme: 'white' | 'dark',
): {theme: Theme; muiTheme: MuiTheme} {
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
