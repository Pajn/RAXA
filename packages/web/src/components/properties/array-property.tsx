import {ArrayProperty, NumberProperty} from 'raxa-common/lib/entities'
import React from 'react'
import {IconButton} from 'react-toolbox/lib/button/IconButton'
import {updateIn} from 'redux-decorated'
import {PropertyProps, PropertyView} from './property'

export type ArrayInputProps<T = any> = PropertyProps<ArrayProperty<T>, Array<T>>

export const ArrayInput = ({property, value, onChange}: ArrayInputProps) =>
  <div>
    {property.modifiable &&
      <IconButton
        icon="add"
        onClick={() =>
          onChange([...value, (property.items as NumberProperty).defaultValue])}
      />}
    {value.map(item =>
      <div>
        {property.modifiable &&
          <div>
            <IconButton
              icon="delete"
              onClick={() => onChange(value.filter(i => i !== item))}
            />
          </div>}
        <PropertyView
          property={property.items}
          value={item}
          onChange={updated => {
            const index = value.indexOf(item)
            onChange(updateIn(index, updated, value))
          }}
        />
      </div>,
    )}
  </div>
