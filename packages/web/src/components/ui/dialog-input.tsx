import * as React from 'react'
import Dialog from 'react-toolbox/lib/dialog/Dialog'
import {ListItem} from 'react-toolbox/lib/list'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import withState from 'recompose/withState'

export type DialogInputProps = {
  label: string
  legend?: string
  value: any
  unit?: string
  onChange: (newValue: any) => void
  children: (tmpValue: any, setTmpValue: (newValue: any) => void) => React.ReactChild
}
export type PrivateDialogInputProps = DialogInputProps & {
  dialogActive: boolean
  showDialog: () =>  void
  hideDialog: () =>  void

  tmpValue: any
  setTmpValue: (value: any) =>  void
}

const enhance = compose(
  withState('dialogActive', 'setShowDialog', false),
  withState('tmpValue', 'setTmpValue', null),
  withHandlers({
    setTmpValue: props => value => props.setTmpValue(value),
    showDialog: props => () => {
      props.setTmpValue(props.value)
      props.setShowDialog(true)
    },
    hideDialog: props => () => props.setShowDialog(false),
  })
)

export const DialogInputView = ({
  label, legend, value, onChange, unit,
  dialogActive, showDialog, hideDialog, tmpValue, setTmpValue, children
}: PrivateDialogInputProps) =>
  <ListItem
    caption={label}
    leftActions={[]}
    legend={legend || (unit ? `${value} ${unit}` : `${value}`)}
    onClick={showDialog}
    rightActions={[
      <Dialog
        key={1}
        active={dialogActive}
        onEscKeyDown={hideDialog}
        onOverlayClick={hideDialog}

        type="small"
        title={label}
        actions={[
          {
            label: 'Cancel',
            onClick: hideDialog,
          },
          {
            primary: true,
            label: 'Ok',
            onClick: () => {
              onChange(tmpValue)
              hideDialog()
            },
          },
        ]}
      >
        {children(tmpValue, setTmpValue)}
      </Dialog>
    ]}
  />

export const DialogInput = enhance(DialogInputView) as React.ComponentClass<DialogInputProps>
