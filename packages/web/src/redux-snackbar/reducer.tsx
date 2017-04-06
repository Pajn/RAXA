import {createReducer} from 'redux-decorated'
import {Snackbar, actions} from './actions'

export const snackbarReducer = createReducer<Snackbar>({active: false, label: ''})
  .when(actions.showSnackbar, (_, snackbar) => ({...snackbar, active: true}))
  .when(actions.hideSnackbar, state => ({...state, active: false}))
  .build()
