import {
  ArrayProperty,
  BooleanProperty,
  DeviceProperty,
  ModificationProperty,
  NumberProperty,
  Property,
  StringProperty,
} from 'raxa-common'
import React from 'react'
import {
  SettingCheckbox,
  SettingInput,
  SettingSlider,
  SettingValue,
} from '../ui/setting-input'
import {ArrayInput} from './array-property'
import {DeviceDispay, DeviceInput} from './device-property'
import {ModificationInput} from './modification-property'

export type PropertyProps<T, V = any> = ModifyablePropertyProps<T, V>
export type ReadonlyPropertyProps<T, V = any> = {
  property: T
  value: V
  label?: string
}

export type ModifyablePropertyProps<T, V = any> = ReadonlyPropertyProps<
  T,
  V
> & {
  onChange: (newValue: any) => void
}

export const GenericDisplay = ({
  property,
  value,
}: ReadonlyPropertyProps<Property>) =>
  <SettingValue
    label={property.name || property.id}
    value={value}
    unit={(property as {unit?: string}).unit}
  />

const NumberInput = ({
  property,
  value,
  onChange,
}: PropertyProps<NumberProperty>) =>
  property.min! + property.max!
    ? <SettingSlider
        label={property.name || property.id}
        value={value}
        onChange={onChange}
        unit={property.unit}
        min={property.min!}
        max={property.max!}
        step={property.type === 'integer' ? 1 : undefined}
      />
    : <SettingInput
        label={property.name || property.id}
        type="number"
        value={value}
        onChange={onChange}
        unit={property.unit}
        min={property.min}
        max={property.max}
      />

const types = {
  array(props: PropertyProps<ArrayProperty<any>>) {
    return <ArrayInput {...props} />
  },
  boolean(props: PropertyProps<BooleanProperty>) {
    return (
      <SettingCheckbox
        label={props.property.name || props.property.id}
        value={props.value}
        onChange={props.onChange}
        disabled={!props.property.modifiable}
      />
    )
  },
  device(props: PropertyProps<DeviceProperty>) {
    return props.property.modifiable
      ? <DeviceInput {...props} />
      : <DeviceDispay {...props} />
  },
  integer(props: PropertyProps<NumberProperty>) {
    return props.property.modifiable
      ? <NumberInput {...props} />
      : <GenericDisplay {...props} />
  },
  modification(props: PropertyProps<ModificationProperty>) {
    return <ModificationInput {...props} />
  },
  number(props: PropertyProps<NumberProperty>) {
    return props.property.modifiable
      ? <NumberInput {...props} />
      : <GenericDisplay {...props} />
  },
  string(props: PropertyProps<StringProperty>) {
    return props.property.modifiable
      ? <SettingInput
          label={props.property.name || props.property.id}
          value={props.value}
          onChange={props.onChange}
          unit={props.property.unit}
        />
      : <GenericDisplay {...props} />
  },
}

export const PropertyView = (props: PropertyProps<Property>) => {
  const Component = types[props.property.type]

  return <Component {...props} />
}
