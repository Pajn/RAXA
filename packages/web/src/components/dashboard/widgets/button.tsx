import glamorous from 'glamorous'
import {
  DeviceStatus,
  GraphQlDevice,
  Interface,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React from 'react'
import {QueryProps, gql, graphql} from 'react-apollo'
import Ripple from 'react-toolbox/lib/ripple'
import {compose, mapProps} from 'recompose'
import styled from 'styled-components'
import {CallDeviceInjectedProps, callDevice} from '../../../lib/mutations'
import {WidgetComponent, WidgetProps} from '../widget'

const Container = glamorous.div({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',

  boxSizing: 'border-box',
  padding: 8,
  height: '100%',
  overflow: 'hidden',
})
const DeviceName = styled.span`
  flex: 1;
`

export type ButtonWidgetConfiguration = {
  deviceId: string
  interfaceId: string
  method: string
}
export type ButtonWidgetProps = WidgetProps<ButtonWidgetConfiguration>
export type PrivateButtonWidgetProps = ButtonWidgetProps &
  CallDeviceInjectedProps & {
    data: {device?: GraphQlDevice; interface?: Interface} & QueryProps
    status?: DeviceStatus
    statusDefinition?: NumberProperty
    children?: React.ReactChild
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
    ripple: true,
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
  callDevice(),
  Ripple({spread: 3}),
)

export const ButtonWidgetView = ({
  data: {device},
  callDevice,
  config,
  children,
  ...props,
}: PrivateButtonWidgetProps) =>
  <Container
    {...props}
    onClick={() =>
      callDevice({
        deviceId: config.deviceId,
        interfaceId: config.interfaceId,
        method: config.method,
        arguments: undefined,
      })}
  >
    <DeviceName>{device && device.name}</DeviceName>
    {children}
  </Container>

export const ButtonWidget: WidgetComponent<
  ButtonWidgetConfiguration
> = Object.assign(enhance(ButtonWidgetView), {
  type: 'ButtonWidget',
  uiName: 'Scenery',
  defaultSize: {width: 2, height: 1},
  demoConfig: {
    deviceId: '',
    interfaceId: 'Scenery',
    method: 'set',
  },
  config: {
    deviceId: {
      id: 'deviceId',
      type: 'device' as 'device',
      name: 'Device',
      interfaceIds: ['Scenery'],
      modifiable: true,
    },
  },
})
