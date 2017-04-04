import {Property} from 'raxa-common'
import * as React from 'react'
import {SettingCheckbox, SettingInput, SettingSlider, SettingValue} from '../ui/setting-input'

export type PropertyProps = ModifyablePropertyProps
export type ReadonlyPropertyProps = {
  property: Property
  value: any
  label?: string
}

export type ModifyablePropertyProps = ReadonlyPropertyProps & {
  onChange: (newValue: any) => void
}

const GenericDisplay = ({property, value}: ReadonlyPropertyProps) =>
  <SettingValue
    label={property.name || property.id}
    value={value}
    unit={property.unit}
  />

const NumberInput = ({property, value, onChange}: PropertyProps) =>
  (property.min! + property.max!)
    ? <SettingSlider
        label={property.name || property.id}
        value={value}
        onChange={onChange}
        unit={property.unit}
        min={property.min!}
        max={property.max!}
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
  boolean(props: PropertyProps) {
    return <SettingCheckbox
      label={props.property.name || props.property.id}
      value={props.value}
      onChange={props.onChange}
      disabled={!props.property.modifiable}
    />
  },
  integer(props: PropertyProps) {
    return props.property.modifiable
      ? <NumberInput {...props} />
      : <GenericDisplay {...props} />
  },
  number(props: PropertyProps) {
    return props.property.modifiable
      ? <NumberInput {...props} />
      : <GenericDisplay {...props} />
  },
  string(props: PropertyProps) {
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

export const PropertyView = (props: PropertyProps) => {
  const Component = types[props.property.type]

  return <Component {...props} />
}
