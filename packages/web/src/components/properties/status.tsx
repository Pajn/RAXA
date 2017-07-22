import {Interface} from 'raxa-common'
import React from 'react'
import {gql, graphql} from 'react-apollo'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {
  UpdateDeviceStatusInjectedProps,
  updateDeviceStatus,
} from '../../lib/mutations'
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

export const enhance = compose(
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
  <div>
    {data &&
      data.interface &&
      data.interface.status &&
      data.interface.status[statusId] &&
      <PropertyView
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
      />}
  </div>

export const StatusView: React.ComponentClass<StatusProps> = enhance(
  StatelessStatusView,
)
