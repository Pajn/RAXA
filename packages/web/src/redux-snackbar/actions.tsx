import {ReactChild} from 'react'
import {Action, createActions} from 'redux-decorated'

export type SnackbarSeed = {
  /// Label for the action component inside the Snackbar.
  action?: string
  /// Text or node to be displayed in the content as alternative to label.
  children?: ReactChild
  /// Additional class name to provide custom styling.
  className?:	string
  /// Text to display in the content.
  label: ReactChild
  /// Callback function that will be called when the button action is clicked.
  onClick?: Function
  /// Amount of time in milliseconds after the Snackbar will be automatically hidden.
  timeout?: number
  type?: 'accept'|'warning'|'cancel',
}
export type Snackbar = SnackbarSeed & {
  active: boolean
}

export const actions = createActions({
  showSnackbar: {} as Action<SnackbarSeed>,
  hideSnackbar: {} as Action<{}>,
})
