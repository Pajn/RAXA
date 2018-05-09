import gql from 'graphql-tag'
import {ListItem} from 'material-ui/List'
import {Interface, defaultInterfaces} from 'raxa-common'
import React from 'react'
import {graphql} from 'react-apollo'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {row} from 'style-definitions'
import {
  UpdateDeviceStatusInjectedProps,
  updateDeviceStatus,
} from '../../lib/mutations'
import {ColorPicker} from '../ui/color-picker'
import {PropertyView} from './property'

export type StatusProps = {
  id: string
  deviceId: string
  interfaceId: string
  statusId: string
  value: any
  label?: string
}
export type PrivateStatusProps = StatusProps &
  UpdateDeviceStatusInjectedProps & {
    data: {interface?: Interface}
  }

export const enhance = compose<PrivateStatusProps, StatusProps>(
  connect(),
  graphql(gql`
    query($interfaceId: String!) {
      interface(id: $interfaceId) {
        id
        status
      }
    }
  `),
  updateDeviceStatus(),
)

export const StatelessStatusView = ({
  id,
  data,
  deviceId,
  interfaceId,
  statusId,
  value,
  label,
  setDeviceStatus,
}: PrivateStatusProps) =>
  data &&
  data.interface &&
  data.interface.status &&
  data.interface.status[statusId] ? (
    interfaceId === defaultInterfaces.Color.id ? (
      <ListItem style={row({vertical: 'center'})}>
        <span style={{paddingRight: 8}}>Color</span>
        <ColorPicker
          value={value}
          onChange={value => {
            setDeviceStatus(id, {
              deviceId,
              interfaceId,
              statusId,
              value,
            })
          }}
        />
      </ListItem>
    ) : (
      <PropertyView
        propertyId={data.interface.status[statusId].id}
        property={data.interface.status[statusId]}
        value={value}
        label={label}
        onChange={value => {
          setDeviceStatus(id, {
            deviceId,
            interfaceId,
            statusId,
            value,
          })
        }}
      />
    )
  ) : null

export const StatusView = enhance(StatelessStatusView)
