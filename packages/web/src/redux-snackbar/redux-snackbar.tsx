import React from 'react'
import {connect} from 'react-redux'
import Snackbar from 'react-toolbox/lib/snackbar/Snackbar'
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
    hideSnackbar: () => dispatch(action(actions.hideSnackbar, {}))
  }),
)

export const ReduxSnackbarView = ({hideSnackbar, snackbar}: PrivateReduxSnackbarProps) =>
  <Snackbar
    active={snackbar.active}
    type={snackbar.type || 'cancel'}
    label={snackbar.label as string}
    action={snackbar.action}
    className={snackbar.className}
    children={snackbar.children}
    onClick={snackbar.onClick || hideSnackbar}
    onTimeout={hideSnackbar}
    timeout={snackbar.timeout || 5000}
  />

export const ReduxSnackbar = enhance(ReduxSnackbarView)
