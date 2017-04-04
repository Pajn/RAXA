import * as React from 'react'
import {Checkbox} from 'react-toolbox/lib/checkbox'
import {Input} from 'react-toolbox/lib/input'
import {ListCheckbox, ListItem} from 'react-toolbox/lib/list'
import {Slider} from 'react-toolbox/lib/slider'
import compose from 'recompose/compose'
import {DialogInput} from './dialog-input'
import {IsMobileProps, withIsMobile} from './mediaQueries'

const asPercent = (min: number, max: number, value: number) =>
  Math.round((100 * (+value - min)) / (max - min))

export const enhance = compose(
  withIsMobile,
)

export type SettingInputProps = SettingValueProps & {
  type?: 'number'
  onChange: (newValue: string) => void

  max?: number
  min?: number
}
export type PrivateSettingInputProps = SettingInputProps & IsMobileProps & {
  children: any
}

export const SettingInputView = ({
  label, type, value, onChange, unit,
  isMobile,
}: PrivateSettingInputProps) =>
  isMobile
    ? <DialogInput
        label={label}
        value={value}
        onChange={onChange}
        unit={unit}
        legend={unit ? `${value} ${unit}` : `${value}`}
        children={(value, setValue) =>
          <Input
            type={type}
            value={value}
            onChange={setValue}
          />
        }
      />
    : <Input
        label={label}
        type={type}
        value={value}
        onChange={onChange}
      />

export const SettingInput = enhance(SettingInputView) as React.ComponentClass<SettingInputProps>

export type SettingCheckboxProps = {
  label: string
  value: boolean
  onChange: (newValue: boolean) => void
  disabled?: boolean
}
export type PrivateSettingCheckboxProps = SettingCheckboxProps & IsMobileProps & {
  children: any
}

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

export const SettingCheckbox = enhance(SettingCheckboxView) as React.ComponentClass<SettingCheckboxProps>

export type SettingSliderProps = SettingValueProps & {
  onChange: (newValue: any) => void

  max: number
  min: number
}
export type PrivateSettingSliderProps = SettingSliderProps & IsMobileProps & {
  children: any
}

export const SettingSliderView = ({
  label, value, onChange, unit, max, min,
  isMobile,
}: PrivateSettingSliderProps) =>
  isMobile
    ? <DialogInput
        label={label}
        value={+value}
        onChange={onChange}
        unit={unit}
        legend={unit
          ? `${value} ${unit}`
          : `${asPercent(min, max, +value)} %`
        }
        children={(value, setValue) =>
          <div>
            <Slider
              value={value}
              onChange={setValue}
              max={max}
              min={min}
            />
            {unit
              ? `${value} ${unit}`
              : `${asPercent(min, max, +value)} %`
            }
          </div>
        }
      />
    : <div>
        <label>
          <span>{label}</span>
          <span>
            <Slider
              value={+value}
              onChange={onChange}
              max={max}
              min={min}
            />
          </span>
        </label>
      </div>

export const SettingSlider = enhance(SettingSliderView) as React.ComponentClass<SettingSliderProps>

export type SettingValueProps = {
  label: string
  value: any
  unit?: string
}
export type PrivateSettingValueProps = SettingValueProps & IsMobileProps & {
  children: any
}

export const SettingValueView = ({
  label, value, unit,
}: PrivateSettingValueProps) =>
  <ListItem
    caption={label}
    legend={unit ? `${value} ${unit}` : `${value}`}
    leftActions={[]}
    rightActions={[]}
  />

export const SettingValue = SettingValueView as React.StatelessComponent<SettingValueProps>
