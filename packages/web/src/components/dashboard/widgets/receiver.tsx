import glamorous from 'glamorous'
import gql from 'graphql-tag'
import Button from 'material-ui/Button'
import {defaultInterfaces} from 'raxa-common'
import {
  DeviceStatus,
  GraphQlDevice,
  Interface,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React from 'react'
import {DataProps, graphql} from 'react-apollo'
import {ProgressButton} from 'react-material-app'
import {compose, mapProps, withHandlers} from 'recompose'
import {row} from 'style-definitions'
import {
  CallDeviceInjectedProps,
  UpdateDeviceStatusInjectedProps,
  callDevice,
  updateDeviceStatus,
} from '../../../lib/mutations'
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

export type ReceiverWidgetConfiguration = {
  deviceId: string
}
export type ReceiverWidgetProps = WidgetProps<ReceiverWidgetConfiguration>
export type PrivateReceiverWidgetProps = ReceiverWidgetProps &
  CallDeviceInjectedProps &
  UpdateDeviceStatusInjectedProps &
  DataProps<{device?: GraphQlDevice; interface?: Interface}> & {
    status?: DeviceStatus
    statusDefinition?: NumberProperty
    children?: React.ReactChild
    call: (method: string) => Promise<any>
  }

export const enhance = compose<PrivateReceiverWidgetProps, ReceiverWidgetProps>(
  mapProps<Partial<PrivateReceiverWidgetProps>, ReceiverWidgetProps>(
    ({config}) => ({
      config,
      deviceId: config.deviceId,
      data: !config.deviceId
        ? ({
            device: {
              id: '',
              name: 'Device',
            } as GraphQlDevice,
          } as PrivateReceiverWidgetProps['data'])
        : undefined,
      ripple: true,
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
  updateDeviceStatus(),
  withHandlers({
    call: ({config, callDevice}) => (method: string) =>
      callDevice({
        deviceId: config.deviceId,
        interfaceId: 'SonyReceiver',
        method,
        arguments: undefined,
      }),
  }),
)

export const ReceiverWidgetView = ({
  data: {device},
  children: _,
  config,
  call,
  setDeviceStatus,
  ...props
}: PrivateReceiverWidgetProps) => (
  <Container {...props}>
    <span>{device && device.name}</span>
    <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
      <div style={row({horizontal: 'flex-end'})}>
        <Button
          size="small"
          style={{minWidth: 48}}
          onClick={() => call('volUp')}
        >
          +
        </Button>
        <Button
          size="small"
          style={{minWidth: 48}}
          onClick={() => call('volDown')}
        >
          -
        </Button>
      </div>
      <div style={row({horizontal: 'flex-end'})}>
        <ProgressButton style={{minWidth: 48}} onClick={() => call('tv')}>
          Tv
        </ProgressButton>
        <ProgressButton style={{minWidth: 48}} onClick={() => call('speakers')}>
          Speakers
        </ProgressButton>
        <ProgressButton
          style={{minWidth: 48}}
          onClick={() =>
            setDeviceStatus(undefined, {
              deviceId: config.deviceId,
              interfaceId: defaultInterfaces.Power.id,
              statusId: defaultInterfaces.Power.status.on.id,
              value: false,
            })
          }
        >
          Off
        </ProgressButton>
      </div>
    </div>
  </Container>
)

export const ReceiverWidget: WidgetComponent<
  ReceiverWidgetConfiguration
> = Object.assign(enhance(ReceiverWidgetView), {
  type: 'ReceiverWidget',
  uiName: 'ReceiverWidget',
  defaultSize: {width: 2, height: 1},
  demoConfig: {
    deviceId: '',
  },
  config: {},
})
