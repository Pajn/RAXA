import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import React from 'react'
import {compose, withStateHandlers} from 'recompose'

export type DialogInputProps = {
  label: string
  legend?: string
  value: any
  unit?: string
  onChange: (newValue: any) => void
  actions?: boolean
  children: (
    tmpValue: any,
    setTmpValue: (newValue: any) => void,
  ) => React.ReactChild
}
export type PrivateDialogInputProps = DialogInputProps & {
  dialogActive: boolean
  showDialog: () => void
  hideDialog: () => void

  tmpValue: any
  setTmpValue: (value: any) => void
}

const enhance = compose<PrivateDialogInputProps, DialogInputProps>(
  withStateHandlers(
    {dialogActive: false, tmpValue: null},
    {
      setTmpValue: (state, props: DialogInputProps) => tmpValue => {
        if (props.actions === false) {
          props.onChange(tmpValue)
          return {...state, dialogActive: false}
        }
        return {...state, tmpValue}
      },
      showDialog: (_, props: DialogInputProps) => () => ({
        tmpValue: props.value,
        dialogActive: true,
      }),
      hideDialog: state => () => ({...state, dialogActive: false}),
    },
  ),
)

export const DialogInputView = ({
  label,
  legend,
  value = '',
  onChange,
  unit,
  actions = true,
  dialogActive,
  showDialog,
  hideDialog,
  tmpValue,
  setTmpValue,
  children,
  ...props
}: PrivateDialogInputProps) => (
  <ListItem {...props} onClick={showDialog} button>
    <ListItemText
      primary={label}
      secondary={legend || (unit ? `${value} ${unit}` : `${value}`)}
    />
    <ListItemSecondaryAction>
      <Dialog key={1} open={dialogActive} onClose={hideDialog}>
        <DialogTitle>{label}</DialogTitle>
        <DialogContent style={{width: '75vw', maxWidth: 'calc(100vw - 144px)'}}>
          {children(tmpValue, setTmpValue)}
        </DialogContent>
        {actions && (
          <DialogActions>
            <Button onClick={hideDialog} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onChange(tmpValue)
                hideDialog()
              }}
              color="primary"
              autoFocus
            >
              Ok
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </ListItemSecondaryAction>
  </ListItem>
)

export const DialogInput = enhance(DialogInputView)
