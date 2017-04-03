import * as React from 'react'
import {Checkbox} from 'react-toolbox/lib/checkbox'
import Dialog from 'react-toolbox/lib/dialog'
import {Input} from 'react-toolbox/lib/input'
import {ListCheckbox, ListItem} from 'react-toolbox/lib/list'
import {withMedia} from 'react-with-media'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import withState from 'recompose/withState'

export type SettingInputProps = SettingValueProps & {
  type?: 'number'
  onChange: (newValue: string) => void

  max?: number
  min?: number
}
export type PrivateSettingInputProps = SettingInputProps & {
  isMobile: true
  children: any
  dialogActive: boolean
  showDialog: () =>  void
  hideDialog: () =>  void

  tmpValue: string
  setTmpValue: (value: string) =>  void
}

export const enhanceInput = compose(
  withMedia('(max-width: 700px)', {name: 'isMobile'}),
  withState('dialogActive', 'setShowDialog', false),
  withState('tmpValue', 'setTmpValue', null),
  withHandlers({
    showDialog: props => () => {
      props.setTmpValue(props.value)
      props.setShowDialog(true)
    },
    hideDialog: props => () => props.setShowDialog(false),
  })
)

export const SettingInputView = ({
  label, type, value, onChange, unit,
  isMobile, dialogActive, showDialog, hideDialog, tmpValue, setTmpValue
}: PrivateSettingInputProps) =>
  isMobile
    ? <ListItem
        caption={label}
        leftActions={[]}
        legend={unit ? `${value} ${unit}`: `${value}`}
        onClick={showDialog}
        rightActions={[
          <Dialog
            active={dialogActive}
            onEscKeyDown={hideDialog}
            onOverlayClick={hideDialog}

            type='small'
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
            <Input
              type={type}
              value={tmpValue}
              onChange={setTmpValue}
            />
          </Dialog>
        ]}
      />
    : <Input
        label={label}
        type={type}
        value={value}
        onChange={onChange}
      />

export const SettingInput = enhanceInput(SettingInputView) as React.ComponentClass<SettingInputProps>

export type SettingCheckboxProps = {
  label: string
  value: boolean
  onChange: (newValue: boolean) => void
  disabled?: boolean
}
export type PrivateSettingCheckboxProps = SettingCheckboxProps & {
  isMobile: true
  children: any
}

export const enhanceCheckbox = compose(
  withMedia('(max-width: 700px)', {name: 'isMobile'})
)

export const SettingCheckboxView = ({
  label, value, onChange, disabled,
  isMobile
}: PrivateSettingCheckboxProps) =>
  isMobile
    ? <ListCheckbox
        caption={label}
        checked={value}
        onChange={onChange}
        disabled={disabled}
      />
    : <Checkbox
        caption={label}
        checked={value}
        onChange={onChange}
        disabled={disabled}
      />

export const SettingCheckbox = enhanceCheckbox(SettingCheckboxView) as React.ComponentClass<SettingCheckboxProps>

export type SettingValueProps = {
  label: string
  value: any
  unit?: string
}
export type PrivateSettingValueProps = SettingValueProps & {
  isMobile: true
  children: any
}

export const enhanceValue = compose(
  withMedia('(max-width: 700px)', {name: 'isMobile'})
)

export const SettingValueView = ({
  label, value, unit,
  isMobile
}: PrivateSettingValueProps) =>
  isMobile
    ? <ListItem
        caption={label}
        legend={unit ? `${value} ${unit}`: `${value}`}
        leftActions={[]}
        rightActions={[]}
      />
    : <div>
        <label>
          <span>{label}</span>
          <span>
            {value}{unit && ` ${unit}`}
          </span>
        </label>
      </div>

export const SettingValue = enhanceValue(SettingValueView) as React.ComponentClass<SettingValueProps>
