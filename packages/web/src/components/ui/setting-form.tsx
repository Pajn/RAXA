import React from 'react'
import {FormHelper, Properties as FormHelperProperties} from 'react-form-helper'
import {ContextActions} from 'react-material-app'
import {Action} from 'react-material-app/lib/Actions'
import {compose, withState} from 'recompose'
import {SettingInput} from './setting-input'

const ContextSaveButton = ({
  disabled,
  onClick,
  formId,
  contextActions = [],
}) => (
  <ContextActions
    contextActions={[
      {
        disabled,
        label: 'Save',
        onClick,
        type: 'submit',
        form: formId,
      },
      ...contextActions,
    ]}
  />
)

export type SettingFormProps = FormHelperProperties<any> & {
  contextActions?: Array<Action>
}
export type PrivateSettingFormProps = SettingFormProps & {
  formId: string
}

export const enhance = compose(
  withState('formId', 'setFormId', () => Math.random()),
)

export const SettingFormView = ({
  contextActions,
  ...props
}: PrivateSettingFormProps) => (
  <FormHelper
    inputComponent={SettingInput}
    buttonComponent={ContextSaveButton}
    buttonProps={{formId: props.formId, contextActions}}
    saveButton="Save"
    dirtyCheck
    {...props}
  />
)

export const SettingForm = enhance(SettingFormView) as React.ComponentClass<
  SettingFormProps
>
