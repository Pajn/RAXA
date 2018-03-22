import {ListSubheader} from 'material-ui/List'
import {
  ActionProperty,
  ArrayProperty,
  BooleanProperty,
  DeviceProperty,
  EnumProperty,
  ModificationProperty,
  NumberProperty,
  ObjectProperty,
  Property,
  PropertyBase,
  StringProperty,
} from 'raxa-common'
import React from 'react'
import {ScheduleInput} from '../ui/schedule-picker'
import {
  SettingCheckbox,
  SettingDropdown,
  SettingInput,
  SettingSlider,
  SettingValue,
} from '../ui/setting-input'
import {ActionInput} from './action-property'
import {ArrayInput} from './array-property'
import {DeviceDispay, DeviceInput} from './device-property'
import {ModificationInput} from './modification-property'

export type PropertyProps<
  T extends PropertyBase,
  V = any
> = ModifyablePropertyProps<T, V>
export type ReadonlyPropertyProps<T extends PropertyBase, V = any> = {
  property: T
  propertyId: string
  value: V
  label?: string
}

export type ModifyablePropertyProps<
  T extends PropertyBase,
  V = any
> = ReadonlyPropertyProps<T, V> & {
  onChange: (newValue: any) => void
}

export const GenericDisplay = ({
  property,
  value,
}: ReadonlyPropertyProps<Property>) => (
  <SettingValue
    label={property.name || property.id}
    value={value}
    unit={(property as {unit?: string}).unit}
  />
)

const NumberInput = ({
  property,
  value,
  onChange,
}: PropertyProps<NumberProperty>) =>
  property.min! + property.max! ? (
    <SettingSlider
      label={property.name || property.id}
      value={value}
      onChange={onChange}
      unit={property.unit}
      min={property.min!}
      max={property.max!}
      step={property.type === 'integer' ? 1 : undefined}
    />
  ) : (
    <SettingInput
      label={property.name || property.id}
      type="number"
      value={value}
      onChange={onChange}
      unit={property.unit}
      min={property.min}
      max={property.max}
    />
  )

const types = {
  action(props: PropertyProps<ActionProperty>) {
    return <ActionInput {...props as any} />
  },
  array(props: PropertyProps<ArrayProperty<any>>) {
    return <ArrayInput {...props} />
  },
  boolean(props: PropertyProps<BooleanProperty>) {
    return (
      <SettingCheckbox
        label={props.property.name || props.property.id}
        value={
          typeof props.value === 'string' ? props.value === 'true' : props.value
        }
        onChange={props.onChange}
        disabled={!props.property.modifiable}
      />
    )
  },
  device(props: PropertyProps<DeviceProperty>) {
    return props.property.modifiable ? (
      <DeviceInput {...props} />
    ) : (
      <DeviceDispay {...props} />
    )
  },
  enum(props: PropertyProps<EnumProperty>) {
    return props.property.modifiable ? (
      <SettingDropdown
        label={props.property.name || props.property.id}
        value={props.value === undefined ? '' : props.value.toString()}
        onChange={props.onChange}
        source={props.property.values.map(({name, value}) => ({
          label: name,
          value: value.toString(),
        }))}
      />
    ) : (
      <GenericDisplay {...props} />
    )
  },
  integer(props: PropertyProps<NumberProperty>) {
    return props.property.modifiable ? (
      <NumberInput {...props} />
    ) : (
      <GenericDisplay {...props} />
    )
  },
  modification(props: PropertyProps<ModificationProperty>) {
    return <ModificationInput {...props} />
  },
  number(props: PropertyProps<NumberProperty>) {
    return props.property.modifiable ? (
      <NumberInput {...props} />
    ) : (
      <GenericDisplay {...props} />
    )
  },
  string(props: PropertyProps<StringProperty>) {
    return props.property.modifiable ? (
      <SettingInput
        label={props.property.name || props.property.id}
        value={props.value}
        onChange={props.onChange}
        unit={props.property.unit}
      />
    ) : (
      <GenericDisplay {...props} />
    )
  },
  cron(props: PropertyProps<StringProperty>) {
    return props.property.modifiable ? (
      <ScheduleInput
        label={props.property.name || props.property.id}
        value={props.value}
        onChange={props.onChange}
      />
    ) : (
      <GenericDisplay {...props} />
    )
  },
  object(props: PropertyProps<ObjectProperty<any>>) {
    return (
      <div style={{paddingLeft: 16, paddingBottom: 8}}>
        <ListSubheader>{props.label || props.property.name}</ListSubheader>
        {Object.entries(props.property.properties).map(([id, property]) => (
          <PropertyView
            key={id}
            propertyId={id}
            property={property}
            value={props.value && props.value[id]}
            onChange={() => {}}
          />
        ))}
      </div>
    )
  },
}

export const PropertyView = (props: PropertyProps<Property>) => {
  if (props.propertyId === 'cron' && props.property.type === 'string') {
    const Component = types.cron
    return <Component {...props as any} />
  }
  const Component = types[props.property.type]

  return <Component {...props} />
}
