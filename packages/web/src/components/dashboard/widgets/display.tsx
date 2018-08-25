import gql from 'graphql-tag'
import {
  DeviceStatus,
  GraphQlDevice,
  Interface,
  NumberProperty,
  Status,
} from 'raxa-common/lib/entities'
import React from 'react'
import {graphql} from 'react-apollo/graphql'
import {DataProps} from 'react-apollo/types'
import styled from 'react-emotion'
import {compose, mapProps, withState} from 'recompose'
import {WidgetComponent, WidgetProps} from '../widget'

const Container = styled('div')({
  height: '100%',
})
const StatusRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  height: 40,
})

export type DisplayWidgetConfiguration = {
  deviceId: string
  interfaceId: string
  statusId: string
}
export type DisplayWidgetProps = WidgetProps<DisplayWidgetConfiguration>
export type PrivateDisplayWidgetProps = DisplayWidgetProps &
  DataProps<{device?: GraphQlDevice; interface?: Interface}> & {
    status?: DeviceStatus
    statusDefinition?: NumberProperty
  }

export const enhance = compose<PrivateDisplayWidgetProps, DisplayWidgetProps>(
  mapProps<Partial<PrivateDisplayWidgetProps>, DisplayWidgetProps>(
    ({config}) => ({
      config,
      deviceId: config.deviceId,
      interfaceId: config.interfaceId,
      interfaceIds: [config.interfaceId],
      statusIds: [config.statusId],
      data: !config.deviceId
        ? ({
            device: {
              id: '',
              name: 'Device',
              status: [
                {interfaceId: 'Temperature', statusId: 'temp', value: '22'},
              ],
            } as GraphQlDevice,
            interface: {
              id: '',
              status: {temp: {unit: '°C'} as Status},
            } as Interface,
          } as PrivateDisplayWidgetProps['data'])
        : undefined,
    }),
  ),
  graphql(
    gql`
      query(
        $deviceId: String!
        $interfaceId: String!
        $interfaceIds: [String!]
        $statusIds: [String!]
      ) {
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
    `,
    {skip: (props: PrivateDisplayWidgetProps) => !props.config.deviceId},
  ),
  mapProps<PrivateDisplayWidgetProps, PrivateDisplayWidgetProps>(props => ({
    ...props,
    status:
      props.data.device &&
      (props.data.device.status &&
        props.data.device.status.find(
          status =>
            status.interfaceId === props.config.interfaceId &&
            status.statusId === props.config.statusId,
        )),
    statusDefinition:
      props.data.interface &&
      props.data.interface.status &&
      props.data.interface.status[props.config.statusId] &&
      (props.data.interface.status[props.config.statusId] as NumberProperty),
  })),
  withState('showDim', 'setShowDim', false),
)

export const DisplayWidgetView = ({
  data: {device},
  status,
  statusDefinition,
}: PrivateDisplayWidgetProps) => (
  <Container>
    <StatusRow>
      <span style={{flex: 1}}>{device && device.name}</span>
      <span>{status && status.value}</span>
      <span>
        {statusDefinition &&
          statusDefinition.unit &&
          ` ${statusDefinition.unit}`}
      </span>
    </StatusRow>
    <div>
      <span>{statusDefinition && statusDefinition.name}</span>
    </div>
  </Container>
)

export const DisplayWidget: WidgetComponent<
  DisplayWidgetConfiguration
> = Object.assign(enhance(DisplayWidgetView), {
  type: 'DisplayWidget',
  uiName: 'Temperature',
  defaultSize: {width: 2, height: 1},
  demoConfig: {
    deviceId: '',
    interfaceId: 'Temperature',
    statusId: 'temp',
  },
})
