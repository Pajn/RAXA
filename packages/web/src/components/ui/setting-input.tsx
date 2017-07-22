import React from 'react'
import {Checkbox} from 'react-toolbox/lib/checkbox'
import {Dropdown} from 'react-toolbox/lib/dropdown'
import {Input} from 'react-toolbox/lib/input'
import {ListCheckbox, ListItem, ListItemLayout} from 'react-toolbox/lib/list'
import {Slider} from 'react-toolbox/lib/slider'
import {withState} from 'recompose'
import {compose} from 'recompose'
import {DialogInput} from './dialog-input'
import {IsMobileProps, withIsMobile} from './mediaQueries'

const asPercent = (min: number, max: number, value: number) =>
  Math.round(100 * (+value - min) / (max - min))

export type SettingInputProps = SettingValueProps & {
  type?: 'number'
  onChange: (newValue: string) => void

  max?: number
  min?: number
}
export type PrivateSettingInputProps = SettingInputProps &
  IsMobileProps & {
    children: any
  }

export const enhance = compose(withIsMobile)

export const SettingInputView = ({
  label,
  type,
  value,
  onChange,
  unit,
  isMobile,
}: PrivateSettingInputProps) =>
  isMobile
    ? <DialogInput
        label={label}
        value={value}
        onChange={onChange}
        unit={unit}
        children={(value, setValue) =>
          <Input type={type} value={value} onChange={setValue} />}
      />
    : <ListItemLayout
        leftActions={[]}
        rightActions={[]}
        itemContent={
          <Input label={label} type={type} value={value} onChange={onChange} />
        }
      />

export const SettingInput = enhance(SettingInputView) as React.ComponentClass<
  SettingInputProps
>

export type SettingCheckboxProps = {
  label: string
  value: boolean
  onChange: (newValue: boolean) => void
  disabled?: boolean
}
export type PrivateSettingCheckboxProps = SettingCheckboxProps &
  IsMobileProps & {
    children: any
  }

export const SettingCheckboxView = ({
  label,
  value,
  onChange,
  disabled,
  isMobile,
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

export const SettingCheckbox = enhance(
  SettingCheckboxView,
) as React.ComponentClass<SettingCheckboxProps>

export type SettingDropdownProps = SettingValueProps & {
  source: Array<{value: string; label: string}>
  onChange: (newValue: string) => void
}
export type PrivateSettingDropdownProps = SettingDropdownProps &
  IsMobileProps & {
    children: any
  }

export const SettingDropdownView = ({
  label,
  source,
  value,
  onChange,
  isMobile,
}: PrivateSettingDropdownProps) =>
  isMobile
    ? <DialogInput
        label={label}
        value={value}
        onChange={onChange}
        legend={(source.find(s => s.value === value) || {label: ''}).label}
        children={(value, setValue) =>
          <Dropdown source={source} value={value} onChange={setValue} />}
      />
    : <ListItemLayout
        leftActions={[]}
        rightActions={[]}
        itemContent={
          <Dropdown
            source={source}
            label={label}
            value={value}
            onChange={onChange}
          />
        }
      />

export const SettingDropdown = enhance(
  SettingDropdownView,
) as React.ComponentClass<SettingDropdownProps>

export type SettingSliderProps = SettingValueProps & {
  onChange: (newValue: any) => void

  max: number
  min: number
  step?: number
}
export type PrivateSettingSliderProps = SettingSliderProps &
  IsMobileProps & {
    children: any
    tmpValue: any
    setTmpValue: (value: any) => void
  }

export const enhanceSlider = compose(
  withIsMobile,
  withState('tmpValue', 'setTmpValue', undefined),
)

export const SettingSliderView = ({
  label,
  value,
  onChange,
  unit,
  max,
  min,
  step,
  isMobile,
  tmpValue,
  setTmpValue,
}: PrivateSettingSliderProps) =>
  isMobile
    ? <DialogInput
        label={label}
        value={+value}
        onChange={onChange}
        unit={unit}
        legend={unit ? `${value} ${unit}` : `${asPercent(min, max, +value)} %`}
        children={(value, setValue) =>
          <div>
            <Slider
              value={value}
              onChange={setValue}
              max={max}
              min={min}
              step={step}
            />
            {unit ? `${value} ${unit}` : `${asPercent(min, max, +value)} %`}
          </div>}
      />
    : <ListItemLayout
        caption={label}
        leftActions={[]}
        rightActions={[]}
        legend={
          (
            <Slider
              value={tmpValue === undefined ? +value : tmpValue}
              onChange={setTmpValue}
              onDragStop={() => {
                setTmpValue(undefined)
                onChange(tmpValue)
              }}
              max={max}
              min={min}
              step={step}
            />
          ) as any
        }
      />

export const SettingSlider = enhanceSlider(
  SettingSliderView,
) as React.ComponentClass<SettingSliderProps>

export type SettingValueProps = {
  label: string
  value: any
  unit?: string
}
export type PrivateSettingValueProps = SettingValueProps &
  IsMobileProps & {
    children: any
  }

export const SettingValueView = ({
  label,
  value,
  unit,
  isMobile,
}: PrivateSettingValueProps) =>
  isMobile
    ? <ListItem
        caption={label}
        legend={unit ? `${value} ${unit}` : `${value}`}
        leftActions={[]}
        rightActions={[]}
      />
    : <ListItem
        leftActions={[]}
        rightActions={[]}
        itemContent={
          <Input
            label={label}
            value={unit ? `${value} ${unit}` : `${value}`}
            disabled
          />
        }
      />

export const SettingValue = enhance(SettingValueView) as React.ComponentClass<
  SettingValueProps
>
