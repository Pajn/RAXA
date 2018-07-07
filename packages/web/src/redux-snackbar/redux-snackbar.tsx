import Snackbar from '@material-ui/core/Snackbar'
import React from 'react'
import {connect} from 'react-redux'
import {action} from 'redux-decorated'
import {Snackbar as SnackbarType, actions} from './actions'

export type ReduxSnackbarProps = {}
export type PrivateReduxSnackbarProps = ReduxSnackbarProps & {
  snackbar: SnackbarType
  hideSnackbar: () => void
}

const enhance = connect(
  state => ({snackbar: state.snackbar}),
  dispatch => ({
    hideSnackbar: () => dispatch(action(actions.hideSnackbar, {})),
  }),
)

export const ReduxSnackbarView = ({
  hideSnackbar,
  snackbar,
}: PrivateReduxSnackbarProps) => (
  <Snackbar
    open={snackbar.active}
    message={
      typeof snackbar.label === 'string' ? (
        <span>{snackbar.label}</span>
      ) : (
        snackbar.label
      )
    }
    action={
      typeof snackbar.action === 'string' ? (
        <span>{snackbar.action}</span>
      ) : (
        snackbar.action
      )
    }
    className={snackbar.className}
    children={snackbar.children}
    onClick={snackbar.onClick || hideSnackbar}
    onClose={hideSnackbar}
    autoHideDuration={snackbar.timeout || 5000}
  />
)

export const ReduxSnackbar = enhance(ReduxSnackbarView)
