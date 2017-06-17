import glamorous from 'glamorous'
import {
  DeviceStatus,
  GraphQlDevice,
  Interface,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React from 'react'
import {gql, graphql} from 'react-apollo/lib'
import {QueryProps} from 'react-apollo/lib/graphql'
import {compose, mapProps} from 'recompose'
import styled from 'styled-components'
import {WidgetComponent, WidgetProps} from '../widget'

const Container = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
})
const DeviceName = styled.span`
  flex: 1;
`

export type ButtonWidgetConfiguration = {
  deviceId: string
  interfaceId: string
  methodId: string
}
export type ButtonWidgetProps = WidgetProps<ButtonWidgetConfiguration>
export type PrivateButtonWidgetProps = ButtonWidgetProps & {
  data: {device?: GraphQlDevice; interface?: Interface} & QueryProps
  status?: DeviceStatus
  statusDefinition?: NumberProperty
}

export const enhance = compose<PrivateButtonWidgetProps, ButtonWidgetProps>(
  mapProps<
    Partial<PrivateButtonWidgetProps>,
    ButtonWidgetProps
  >(({config}) => ({
    config,
    deviceId: config.deviceId,
    data: !config.deviceId
      ? {
          device: {
            id: '',
            name: 'Device',
          } as GraphQlDevice,
        } as PrivateButtonWidgetProps['data']
      : undefined,
  })),
  graphql(
    gql`
    query($deviceId: String!) {
      device(id: $deviceId) {
        id
        name
      }
    }
  `,
    {skip: props => !props.config.deviceId},
  ),
  mapProps<PrivateButtonWidgetProps, PrivateButtonWidgetProps>(props => ({
    ...props,
  })),
)

export const ButtonWidgetView = ({data: {device}}: PrivateButtonWidgetProps) =>
  <Container>
    <DeviceName>{device && device.name}</DeviceName>
  </Container>

export const ButtonWidget: WidgetComponent<
  ButtonWidgetConfiguration
> = Object.assign(enhance(ButtonWidgetView), {
  uiName: 'Button',
  defaultSize: {width: 2, height: 1},
  demoConfig: {
    deviceId: '',
    interfaceId: 'Temperature',
    methodId: 'temp',
  },
})
