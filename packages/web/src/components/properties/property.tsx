import * as React from 'react'
import {Property} from 'raxa-common'

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
  <span>
    {value}{property.unit && ` ${property.unit}`}
  </span>

const NumberInput = ({property, value, onChange}: PropertyProps) =>
  (property.min! + property.max!)
    ? <div>
        <input
          type='range'
          value={value}
          onChange={e => onChange(e.target.value)}
          min={property.min}
          max={property.max}
        />
        <span>
          {value}{property.unit && ` ${property.unit}`}
        </span>
      </div>
    : <input
        type='number'
        value={value}
        onChange={e => onChange(e.target.value)}
        min={property.min}
        max={property.max}
      />

const types = {
  boolean(props: PropertyProps) {
    return props.property.modifiable
      ? <input type='checkbox' value={props.value} onChange={e => props.onChange(e.target.value)} />
      : <input type='checkbox' value={props.value} disabled />
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
      ? <input value={props.value} onChange={e => props.onChange(e.target.value)} />
      : <GenericDisplay {...props} />
  },
}

export const PropertyView = ({label, ...props}: PropertyProps) => {
  const Component = types[props.property.type]

  if (label) {
    return (
      <div>
        <label>
          <span style={{fontWeight: 500}}>{label} </span>
          <Component {...props} />
        </label>
      </div>
    )
  }
  else return <Component {...props} />
}
