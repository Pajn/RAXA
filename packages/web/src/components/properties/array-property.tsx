import Flexbox from 'flexbox-react'
import {ArrayProperty, NumberProperty} from 'raxa-common/lib/entities'
import React from 'react'
import BadIconButton from 'react-toolbox/lib/button/IconButton'
import {Card} from 'react-toolbox/lib/card'
import {ListDivider} from 'react-toolbox/lib/list'
import {updateIn} from 'redux-decorated'
import styled from 'styled-components'
import {Modification} from '../../../../common/lib/entities'
import {DeviceName} from '../device-name'
import {PropertyProps, PropertyView} from './property'

const IconButton: any = BadIconButton

const Title = styled.span`
  font-size: 18px;
  flex: 1;
`

const SubTitle = styled.span`
  font-size: 16px;
  flex: 1;
`

export type ArrayInputProps<T = any> = PropertyProps<ArrayProperty<T>, Array<T>>

export const ArrayInput = ({property, value, onChange}: ArrayInputProps) =>
  <div>
    <Flexbox alignItems="center">
      {property.name && <Title>{property.name}</Title>}
      {property.modifiable &&
        <IconButton
          icon="add"
          onClick={() =>
            onChange([
              ...(value || []),
              (property.items as NumberProperty).defaultValue,
            ])}
        />}
    </Flexbox>
    {(value || []).map(item =>
      <div style={{margin: 16, marginBottom: 8}}>
        <Card>
          {property.modifiable &&
            <div>
              <Flexbox style={{padding: 8}} alignItems="center">
                {property.items.type === 'modification' &&
                  <SubTitle>
                    {item
                      ? <DeviceName id={(item as Modification).deviceId} />
                      : 'Add Device'}
                  </SubTitle>}
                <IconButton
                  icon="delete"
                  onClick={() => onChange(value.filter(i => i !== item))}
                />
              </Flexbox>
              <ListDivider />
            </div>}
          <div style={{padding: '8px 16px'}}>
            <PropertyView
              property={property.items}
              value={item}
              onChange={updated => {
                const index = value.indexOf(item)
                onChange(updateIn(index, updated, value))
              }}
            />
          </div>
        </Card>
      </div>,
    )}
  </div>
