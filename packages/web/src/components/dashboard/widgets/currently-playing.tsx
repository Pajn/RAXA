import IconButton from '@material-ui/core/IconButton'
import PauseIcon from '@material-ui/icons/Pause'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import gql from 'graphql-tag'
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
import {compose, mapProps, withHandlers} from 'recompose'
import {column, row} from 'style-definitions'
import {
  CallDeviceInjectedProps,
  UpdateDeviceStatusInjectedProps,
  callDevice,
  updateDeviceStatus,
} from '../../../lib/mutations'
import {WidgetComponent, WidgetProps} from '../widget'

function asObject(
  array: Iterable<DeviceStatus>,
): {[interfaceId: string]: {[statusId: string]: DeviceStatus}} {
  const object = {}
  for (const element of array) {
    if (object[element.interfaceId] === undefined) {
      object[element.interfaceId] = {}
    }
    object[element.interfaceId][element.statusId] = element
  }
  return object
}

const Container = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',

  boxSizing: 'border-box',
  height: '100%',
  overflow: 'hidden',
})

export type CurrentlyPlayingWidgetConfiguration = {
  deviceId: string
}
export type CurrentlyPlayingWidgetProps = WidgetProps<
  CurrentlyPlayingWidgetConfiguration
>
export type PrivateCurrentlyPlayingWidgetProps = CurrentlyPlayingWidgetProps &
  CallDeviceInjectedProps &
  UpdateDeviceStatusInjectedProps &
  DataProps<{device?: GraphQlDevice; interface?: Interface}> & {
    status?: {[interfaceId: string]: {[statusId: string]: DeviceStatus}}
    statusDefinition?: NumberProperty
    children?: React.ReactChild
    call: (method: string) => Promise<any>
    hideComponent?: (isHidden: boolean) => null
  }

export const enhance = compose<
  PrivateCurrentlyPlayingWidgetProps,
  CurrentlyPlayingWidgetProps
>(
  mapProps<
    Partial<PrivateCurrentlyPlayingWidgetProps>,
    CurrentlyPlayingWidgetProps
  >(({config, ...props}) => ({
    ...props,
    config,
    deviceId: config.deviceId,
    data: !config.deviceId
      ? ({
          device: {
            id: '',
            name: 'Device',
          } as GraphQlDevice,
        } as PrivateCurrentlyPlayingWidgetProps['data'])
      : undefined,
    ripple: true,
  })),
  graphql(
    gql`
      query($deviceId: String!) {
        device(id: $deviceId) {
          id
          name
          status(interfaceIds: ["CurrentlyPlaying", "Volume"]) {
            id
            interfaceId
            statusId
            value
          }
        }
      }
    `,
    {skip: props => !props.config.deviceId},
  ),
  mapProps<
    PrivateCurrentlyPlayingWidgetProps,
    PrivateCurrentlyPlayingWidgetProps
  >(
    (
      props: PrivateCurrentlyPlayingWidgetProps,
    ): PrivateCurrentlyPlayingWidgetProps => ({
      ...props,
      status: props.data.device && asObject(props.data.device.status),
    }),
  ),
  callDevice(),
  updateDeviceStatus(),
  withHandlers({
    call: ({config, callDevice}) => (method: string) =>
      callDevice({
        deviceId: config.deviceId,
        interfaceId: 'CurrentlyPlaying',
        method,
        arguments: undefined,
      }),
  }),
)

export const CurrentlyPlayingWidgetView = ({
  data: {device},
  status,
  children: _,
  call,
  hideComponent,
  ...props
}: PrivateCurrentlyPlayingWidgetProps) =>
  device &&
  status &&
  status.CurrentlyPlaying &&
  status.CurrentlyPlaying.playerState &&
  status.CurrentlyPlaying.currentMedia &&
  status.CurrentlyPlaying.currentMedia.value &&
  status.CurrentlyPlaying.playerState.value !== 'idle' ? (
    <Container {...props}>
      {hideComponent ? hideComponent(false) : null}
      <img
        src={status.CurrentlyPlaying.currentMedia.value.artwork}
        style={{width: 96, height: 96}}
      />
      <div style={{...column(), flex: 1, paddingLeft: 16, overflow: 'hidden'}}>
        <span>{device.name}</span>
        <span style={{paddingTop: 6}}>
          {status.CurrentlyPlaying.currentMedia.value.title}
        </span>
      </div>
      <div style={{...row({horizontal: 'center', vertical: 'center'})}}>
        <IconButton
          onClick={() =>
            call(
              status.CurrentlyPlaying.playerState.value === 'playing'
                ? 'pause'
                : 'play',
            )
          }
        >
          {status.CurrentlyPlaying.playerState.value === 'playing' ? (
            <PauseIcon />
          ) : (
            <PlayArrowIcon />
          )}
        </IconButton>
      </div>
    </Container>
  ) : hideComponent ? (
    hideComponent(true)
  ) : null

export const CurrentlyPlayingWidget: WidgetComponent<
  CurrentlyPlayingWidgetConfiguration
> = Object.assign(enhance(CurrentlyPlayingWidgetView), {
  type: 'CurrentlyPlayingWidget',
  uiName: 'CurrentlyPlayingWidget',
  defaultSize: {width: 2, height: 1},
  demoConfig: {
    deviceId: '',
  },
  config: {},
})
