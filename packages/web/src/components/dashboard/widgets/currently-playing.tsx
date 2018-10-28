import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import Slide from '@material-ui/core/Slide'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import PauseIcon from '@material-ui/icons/Pause'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import gql from 'graphql-tag'
import loadable from 'loadable-components'
import {
  CurrentlyPlayingStatus,
  defaultInterfaces,
} from 'raxa-common/lib/default-interfaces'
import {
  Device,
  DeviceStatus,
  GraphQlDevice,
  Interface,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React, {ReactNode} from 'react'
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
import {Theme} from '../../../theme'
import {WidgetComponent, WidgetProps} from '../widget'

export const LazyDialog = loadable(() => import('@material-ui/core/Dialog'), {
  LoadingComponent: () => null,
})

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

function DialogTransition(props) {
  return <Slide direction="up" {...props} />
}

const MediaDialogContainer = styled('div')<{}, Theme>(({theme}) => ({
  ...column({horizontal: 'stretch'}),
  margin: '0 auto',
  width: '100%',
  height: '100%',

  color: theme.background.text,
  backgroundColor: theme.background.main,
}))

const MediaDialog = ({
  open,
  onClose,
  device,
  currentlyPlaying,
  call,
}: {
  open: boolean
  onClose: () => void
  device: Device
  currentlyPlaying: CurrentlyPlayingStatus
  call: (interfaceId: string, method: string) => Promise<any>
}) => (
  <LazyDialog
    fullScreen
    open={open}
    onClose={onClose}
    TransitionComponent={DialogTransition}
    onClick={e => e.stopPropagation()}
  >
    <AppBar position="static">
      <Toolbar>
        <IconButton color="inherit" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
        <Typography variant="title" color="inherit">
          {device.name}
        </Typography>
      </Toolbar>
    </AppBar>
    <MediaDialogContainer>
      <div
        style={{
          ...row({vertical: 'center'}),
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: '8px 24px',
          height: 92,
        }}
      >
        <div style={{...column(), flex: 1, textAlign: 'center'}}>
          <Typography variant="subtitle1">
            {currentlyPlaying.currentMedia.title}
          </Typography>
          {currentlyPlaying.currentMedia.album &&
            currentlyPlaying.currentMedia.artist && (
              <Typography variant="body1">
                {currentlyPlaying.currentMedia.album}
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    textAlign: 'center',
                  }}
                >
                  &bull;
                </span>
                {currentlyPlaying.currentMedia.artist}
              </Typography>
            )}
        </div>
      </div>
      <div
        style={{
          ...column({horizontal: 'center', vertical: 'center'}),
          flex: 1,
          objectFit: 'contain',
        }}
      >
        {currentlyPlaying.currentMedia.artwork && (
          <img
            src={currentlyPlaying.currentMedia.artwork}
            style={{height: '100%', maxWidth: '100%', objectFit: 'contain'}}
          />
        )}
      </div>
      <div
        style={{
          ...row({horizontal: 'center'}),
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: '8px 24px',
          height: 92,
        }}
      >
        <div style={{...row({vertical: 'center'})}}>
          <IconButton
            onClick={() =>
              call(
                defaultInterfaces.MediaPlaylist.id,
                defaultInterfaces.MediaPlaylist.methods.previous.id,
              )
            }
          >
            <SkipPreviousIcon fontSize="large" />
          </IconButton>
          <IconButton
            onClick={() =>
              call(
                defaultInterfaces.CurrentlyPlaying.id,
                currentlyPlaying.playerState === 'playing'
                  ? defaultInterfaces.CurrentlyPlaying.methods.pause.id
                  : defaultInterfaces.CurrentlyPlaying.methods.play.id,
              )
            }
          >
            {currentlyPlaying.playerState === 'playing' ? (
              <PauseIcon style={{fontSize: 48}} />
            ) : (
              <PlayArrowIcon style={{fontSize: 48}} />
            )}
          </IconButton>
          <IconButton>
            <SkipNextIcon
              fontSize="large"
              onClick={() =>
                call(
                  defaultInterfaces.MediaPlaylist.id,
                  defaultInterfaces.MediaPlaylist.methods.next.id,
                )
              }
            />
          </IconButton>
        </div>
      </div>
    </MediaDialogContainer>
  </LazyDialog>
)

const Container = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',

  boxSizing: 'border-box',
  height: 96,
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
    call: (interfaceId: string, method: string) => Promise<any>
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
    call: ({config, callDevice}) => (interfaceId: string, method: string) =>
      callDevice({
        deviceId: config.deviceId,
        interfaceId,
        method,
        arguments: undefined,
      }),
  }),
)

const getCurrentlyPlaying = (status?: {
  [interfaceId: string]: {[statusId: string]: DeviceStatus}
}): CurrentlyPlayingStatus | undefined =>
  status &&
  status.CurrentlyPlaying &&
  status.CurrentlyPlaying.playerState &&
  status.CurrentlyPlaying.currentMedia &&
  status.CurrentlyPlaying.currentMedia.value &&
  status.CurrentlyPlaying.playerState.value !== 'idle'
    ? {
        currentMedia: status.CurrentlyPlaying.currentMedia.value,
        playerState: status.CurrentlyPlaying.playerState.value,
      }
    : undefined

class WithState<T> extends React.Component<
  {
    initialState: T
    children: (
      state: T,
      setState: (update: T, cb?: () => void) => void,
    ) => ReactNode
  },
  {state: T}
> {
  state = {state: this.props.initialState}
  _setState = (state: T, cb?: () => void) => this.setState({state}, cb)

  render() {
    return this.props.children(this.state.state, this._setState)
  }
}

export const CurrentlyPlayingWidgetView = ({
  data: {device},
  status,
  children: _,
  call,
  hideComponent,
  ...props
}: PrivateCurrentlyPlayingWidgetProps) => {
  const currentlyPlaying = getCurrentlyPlaying(status)

  return device && currentlyPlaying ? (
    <WithState initialState={false}>
      {(dialogOpen, setDialogOpen) => (
        <Container {...props} onClick={() => setDialogOpen(true)}>
          {hideComponent ? hideComponent(false) : null}
          {currentlyPlaying.currentMedia.artwork && (
            <img
              src={currentlyPlaying.currentMedia.artwork}
              style={{width: 96, height: 96, objectFit: 'cover'}}
            />
          )}
          <div
            style={{...column(), flex: 1, paddingLeft: 16, overflow: 'hidden'}}
          >
            <span>{device.name}</span>
            <span style={{paddingTop: 6}}>
              {currentlyPlaying.currentMedia.title}
            </span>
            {currentlyPlaying.currentMedia.artist && (
              <Typography variant="body1">
                {currentlyPlaying.currentMedia.artist}
              </Typography>
            )}
          </div>
          <div
            style={{
              ...row({horizontal: 'center', vertical: 'center'}),
              paddingRight: 8,
            }}
          >
            <IconButton
              onClick={e => {
                e.stopPropagation()
                call(
                  defaultInterfaces.CurrentlyPlaying.id,
                  currentlyPlaying.playerState === 'playing'
                    ? defaultInterfaces.CurrentlyPlaying.methods.pause.id
                    : defaultInterfaces.CurrentlyPlaying.methods.play.id,
                )
              }}
            >
              {currentlyPlaying.playerState === 'playing' ? (
                <PauseIcon />
              ) : (
                <PlayArrowIcon />
              )}
            </IconButton>
          </div>
          <MediaDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            device={device}
            currentlyPlaying={currentlyPlaying}
            call={call}
          />
        </Container>
      )}
    </WithState>
  ) : hideComponent ? (
    hideComponent(true)
  ) : null
}

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
