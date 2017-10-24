import React from 'react'
import {FormHelper, Properties as FormHelperProperties} from 'react-form-helper'
import {compose, withState} from 'recompose'
import {ContextAction} from './scaffold/context'
import {ContextActions} from './scaffold/context-actions'
import {SettingInput} from './setting-input'

const ContextSaveButton = ({disabled, onClick, formId, contextActions = []}) =>
  <ContextActions
    contextActions={[
      {
        disabled,
        label: 'Save',
        onClick,
        type: 'submit',
        form: formId,
      } as ContextAction,
      ...contextActions,
    ]}
  />

export type SettingFormProps = FormHelperProperties<any, any> & {
  contextActions?: Array<ContextAction>
}
export type PrivateSettingFormProps = SettingFormProps & {
  formId: string
}

export const enhance = compose(
  withState('formId', 'setFormId', () => Math.random()),
)

export const SettingFormView = ({
  contextActions,
  ...props,
}: PrivateSettingFormProps) =>
  <FormHelper
    inputComponent={SettingInput}
    buttonComponent={ContextSaveButton}
    buttonProps={{formId: props.formId, contextActions}}
    saveButton="Save"
    dirtyCheck
    {...props}
  />

export const SettingForm = enhance(SettingFormView) as React.ComponentClass<
  SettingFormProps
>
