import Slider from 'material-ui-old/Slider'
import React, {CSSProperties, ReactChild} from 'react'
import {Checkbox, Select, TextField} from 'react-material-app'
import {compose, withState} from 'recompose'
import {DialogInput} from './dialog-input'
import {IsMobileProps, withIsMobile} from './mediaQueries'

const ListItem = ({
  style,
  children,
  onClick,
}: {
  style?: CSSProperties
  children?: ReactChild | Array<ReactChild>
  onClick?: () => void
}) => (
  <div style={{display: 'flex', padding: '0 16px', ...style}} onClick={onClick}>
    {children}
  </div>
)

export const ListItemLayout = ({
  caption,
  legend,
  onClick,
}: {
  caption: ReactChild
  legend: ReactChild
  onClick?: () => void
}) => (
  <ListItem style={{flexDirection: 'column'}} onClick={onClick}>
    <div style={{fontSize: 16, color: '#212121'}}>{caption}</div>
    <div style={{paddingTop: 3, fontSize: 14, color: '#757575'}}>{legend}</div>
  </ListItem>
)

const round = (decimals: number, value: number) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals

const autoRound = (min: number, max: number, value: number) =>
  round(Math.max(2 - Math.log10(max - min), 0), value)

const asPercent = (min: number, max: number, value: number) =>
  Math.round(100 * (+value - min) / (max - min))

export type SettingInputProps = SettingValueProps & {
  type?: 'number'
  onChange: (newValue: string) => void

  max?: number
  min?: number
  propertyId?: string
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
  isMobile ? (
    <DialogInput
      label={label}
      value={value || ''}
      onChange={onChange}
      unit={unit}
      children={(value, setValue) => (
        <TextField type={type} value={value} onChange={setValue} />
      )}
    />
  ) : (
    <ListItem>
      <TextField
        label={label}
        type={type}
        value={value || ''}
        onChange={onChange}
      />
    </ListItem>
  )

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
}: PrivateSettingCheckboxProps) => (
  <ListItem>
    <Checkbox
      value={value}
      onChange={onChange}
      label={label}
      disabled={disabled}
    />
  </ListItem>
)

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
  isMobile ? (
    <DialogInput
      label={label}
      value={value}
      onChange={onChange}
      legend={(source.find(s => s.value === value) || {label: ''}).label}
      children={(value, setValue) => (
        <Select
          fullWidth
          choices={source}
          value={value || ''}
          onChange={setValue}
        />
      )}
    />
  ) : (
    <ListItem>
      <Select
        choices={source}
        label={label}
        value={value || ''}
        onChange={onChange}
      />
    </ListItem>
  )

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
  isMobile ? (
    <DialogInput
      label={label}
      value={+value || 0}
      onChange={onChange}
      unit={unit}
      legend={
        unit
          ? `${autoRound(min, max, value)} ${unit}`
          : `${asPercent(min, max, +value)} %`
      }
      children={(value, setValue) => (
        <div>
          <Slider
            value={value}
            onChange={(_, value) => setValue(value)}
            max={max}
            min={min}
            step={step}
          />
          {unit
            ? `${autoRound(min, max, value)} ${unit}`
            : `${asPercent(min, max, +value)} %`}
        </div>
      )}
    />
  ) : (
    <ListItemLayout
      caption={label}
      legend={
        <Slider
          value={(tmpValue === undefined ? +value : tmpValue) || 0}
          onChange={(_, value) => setTmpValue(value)}
          onDragStop={() => {
            setTmpValue(undefined)
            onChange(tmpValue)
          }}
          max={max}
          min={min}
          step={step}
        />
      }
    />
  )

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
  isMobile ? (
    <ListItemLayout
      caption={label}
      legend={unit ? `${value} ${unit}` : `${value}`}
    />
  ) : (
    <ListItem>
      <TextField
        label={label}
        value={unit ? `${value} ${unit}` : `${value}`}
        disabled
      />
    </ListItem>
  )

export const SettingValue = enhance(SettingValueView) as React.ComponentClass<
  SettingValueProps
>
