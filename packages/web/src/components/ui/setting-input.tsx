import glamorous from 'glamorous'
import React, {CSSProperties, ReactChild} from 'react'
import {Checkbox} from 'react-toolbox/lib/checkbox'
import {Dropdown} from 'react-toolbox/lib/dropdown'
import {Input} from 'react-toolbox/lib/input'
import {ListCheckbox} from 'react-toolbox/lib/list'
import {Slider} from 'react-toolbox/lib/slider'
import {compose, withState} from 'recompose'
import theme from '../../toolbox/theme'
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

const FixedSlider = glamorous(Slider)({
  [`& .${theme.RTSlider.knob}`]: {
    zIndex: 1,
  },
})

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
        <Input type={type} value={value} onChange={setValue} />
      )}
    />
  ) : (
    <ListItem>
      <Input
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
  isMobile,
}: PrivateSettingCheckboxProps) =>
  isMobile ? (
    <ListCheckbox
      caption={label}
      checked={value}
      onChange={onChange}
      disabled={disabled}
    />
  ) : (
    <ListItem>
      <span style={{paddingRight: 4}}>{label}</span>
      <Checkbox checked={value} onChange={onChange} disabled={disabled} />
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
        <Dropdown source={source} value={value || ''} onChange={setValue} />
      )}
    />
  ) : (
    <ListItem>
      <Dropdown
        source={source}
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
          <FixedSlider
            value={value}
            onChange={setValue}
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
        <FixedSlider
          value={(tmpValue === undefined ? +value : tmpValue) || 0}
          onChange={setTmpValue}
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
      <Input
        label={label}
        value={unit ? `${value} ${unit}` : `${value}`}
        disabled
      />
    </ListItem>
  )

export const SettingValue = enhance(SettingValueView) as React.ComponentClass<
  SettingValueProps
>
