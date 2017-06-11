import {
  DeviceStatus,
  GraphQlDevice,
  Interface,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React from 'react'
import {gql, graphql} from 'react-apollo/lib'
import {QueryProps} from 'react-apollo/lib/graphql'
import compose from 'recompose/compose'
import mapProps from 'recompose/mapProps'
import styled from 'styled-components'
import {WidgetProps} from '../widget'

const DeviceName = styled.span``
const StatusName = styled.span``
const Value = styled.span``
const Unit = styled.span``

export type DisplayWidgetConfiguration = {
  deviceId: string
  interfaceId: string
  statusId: string
}
export type DisplayWidgetProps = WidgetProps<DisplayWidgetConfiguration>
export type PrivateDisplayWidgetProps = DisplayWidgetProps & {
  data: {device?: GraphQlDevice; interface?: Interface} & QueryProps
  status?: DeviceStatus
  statusDefinition?: NumberProperty
}

export const enhance = compose(
  mapProps(({config}: DisplayWidgetProps) => ({
    config,
    deviceId: config.deviceId,
    interfaceId: config.interfaceId,
    interfaceIds: [config.interfaceId],
    statusIds: [config.statusId],
  })),
  graphql(gql`
    query($deviceId: String!, $interfaceId: String!, $interfaceIds: [String!], $statusIds: [String!]) {
      device(id: $deviceId) {
        id
        name
        status(interfaceIds: $interfaceIds, statusIds: $statusIds) {
          id
          interfaceId
          statusId
          value
        }
      }
      interface(id: $interfaceId) {
        status
      }
    }
  `),
  mapProps((props: PrivateDisplayWidgetProps) => ({
    ...props,
    status:
      props.data.device &&
        props.data.device.status &&
        props.data.device.status.find(
          status =>
            status.interfaceId === props.config.interfaceId &&
            status.statusId === props.config.statusId,
        ),
    statusDefinition:
      props.data.interface &&
        props.data.interface.status &&
        props.data.interface.status[props.config.statusId] &&
        props.data.interface.status[props.config.statusId],
  })),
)

export const DisplayWidgetView = ({
  data: {device},
  status,
  statusDefinition,
}: PrivateDisplayWidgetProps) =>
  <div>
    <div>
      <DeviceName>{device && device.name}</DeviceName>
      <StatusName>{statusDefinition && statusDefinition.name}</StatusName>
    </div>
    <div>
      <Value>{status && status.value}</Value>
      <Unit>
        {statusDefinition &&
          statusDefinition.unit &&
          ` ${statusDefinition.unit}`}
      </Unit>
    </div>
  </div>

export const DisplayWidget: React.ComponentClass<DisplayWidgetProps> = enhance(
  DisplayWidgetView,
)
