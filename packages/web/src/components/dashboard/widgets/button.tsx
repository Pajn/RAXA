import ButtonBase from '@material-ui/core/ButtonBase/ButtonBase'
import gql from 'graphql-tag'
import {subheading1} from 'material-definitions'
import {
  DeviceStatus,
  GraphQlDevice,
  Interface,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React from 'react'
import {graphql} from 'react-apollo/graphql'
import {DataProps} from 'react-apollo/types'
import styled from 'react-emotion'
import {compose, mapProps} from 'recompose'
import {CallDeviceInjectedProps, callDevice} from '../../../lib/mutations'
import {WidgetComponent, WidgetProps} from '../widget'
import {draggingContext} from './list'

const Container = styled(ButtonBase)({
  '&&': {
    position: 'absolute',
    display: 'flex',
    padding: 8,
  },
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  boxSizing: 'border-box',
  height: '100%',
  width: '100%',

  ...subheading1,
})

export type ButtonWidgetConfiguration = {
  deviceId: string
  interfaceId: string
  method: string
}
export type ButtonWidgetProps = WidgetProps<ButtonWidgetConfiguration>
export type PrivateButtonWidgetProps = ButtonWidgetProps &
  CallDeviceInjectedProps &
  DataProps<{device?: GraphQlDevice; interface?: Interface}> & {
    status?: DeviceStatus
    statusDefinition?: NumberProperty
    children?: React.ReactChild
  }

export const enhance = compose<PrivateButtonWidgetProps, ButtonWidgetProps>(
  mapProps<Partial<PrivateButtonWidgetProps>, ButtonWidgetProps>(
    ({config}) => ({
      config,
      deviceId: config.deviceId,
      data: !config.deviceId
        ? ({
            device: {
              id: '',
              name: 'Device',
            } as GraphQlDevice,
          } as PrivateButtonWidgetProps['data'])
        : undefined,
    }),
  ),
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
)

export const ButtonWidgetView = ({
  data: {device},
  callDevice,
  config,
  children,
}: PrivateButtonWidgetProps) => (
  <draggingContext.Consumer>
    {({isDragging}) => (
      <Container
        disableRipple={isDragging}
        onClick={() =>
          callDevice({
            deviceId: config.deviceId,
            interfaceId: config.interfaceId,
            method: config.method,
            arguments: undefined,
          })
        }
      >
        <span style={{flex: 1}}>{device && device.name}</span>
        {children}
      </Container>
    )}
  </draggingContext.Consumer>
)

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
