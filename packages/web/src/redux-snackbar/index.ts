import loadable from 'loadable-components'

export {actions} from './actions'
export {snackbarReducer} from './reducer'

export const ReduxSnackbar = loadable(() =>
  import('./redux-snackbar').then(module => module.ReduxSnackbar),
)
