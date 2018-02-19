import glamorous from 'glamorous'
import Slider from 'material-ui-old/Slider'
import ButtonBase from 'material-ui/ButtonBase/ButtonBase'
import {
  DeviceStatus,
  GraphQlDevice,
  Interface,
  defaultInterfaces,
} from 'raxa-common'
import React from 'react'
import {QueryProps, gql, graphql} from 'react-apollo'
import {Switch} from 'react-material-app'
import {compose, mapProps, withStateHandlers} from 'recompose'
import {updateIn} from 'redux-decorated'
import {
  UpdateDeviceStatusInjectedProps,
  updateDeviceStatus,
} from '../../../lib/mutations'
import {withThrottledMutation} from '../../../with-throttled-mutation'
import {ColorPicker} from '../../ui/color-picker'
import {WidgetComponent, WidgetProps} from '../widget'

const Container = glamorous(ButtonBase, {withProps: {component: 'div'}})({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  flexDirection: 'column',

  padding: 8,
  width: '100%',
  height: '100%',

  '> div': {
    width: '100%',
  },
})
const NameRow = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  height: 40,
})
const DeviceName = glamorous.span({
  flexGrow: 1,
})
const DetailControl = glamorous.div({
  flex: 10,
})
const PowerSwitch = glamorous(Switch, {
  withProps: {
    color: 'primary',
  },
})({
  flexShrink: 0,
  '&&': {marginBottom: 5},
})

const interfaceIds = [
  defaultInterfaces.Power.id,
  defaultInterfaces.Dimmer.id,
  defaultInterfaces.Color.id,
]

export type LightWidgetConfiguration = {
  deviceId: string
}
export type LightWidgetProps = WidgetProps<LightWidgetConfiguration> & {
  enableSort?: (deviceId: string) => void
  disableSort?: (deviceId: string) => void
}
export type PrivateLightWidgetProps = LightWidgetProps &
  UpdateDeviceStatusInjectedProps & {
    data: {device?: GraphQlDevice; interface?: Interface} & QueryProps
    status?: {[id: string]: DeviceStatus}
    showDetail: boolean
    setShowDetail: (showDetail: boolean) => void
    setDimmer: (value: string) => void
    setColor: (value: number) => void
  }

function asObject<T, K extends keyof T>(
  array: Iterable<T>,
  idProp: K = 'id' as K,
): {[id: string]: T} {
  const object = {}
  for (const element of array) {
    object[(element[idProp] as any) as string] = element
  }
  return object
}

export const enhance = compose<PrivateLightWidgetProps, LightWidgetProps>(
  mapProps<Partial<PrivateLightWidgetProps>, LightWidgetProps>(
    ({config, ...props}) => ({
      ...props,
      config,
      deviceId: config.deviceId,
      interfaceIds,
      data: !config.deviceId
        ? ({
            device: {
              id: '',
              name: 'Device',
              interfaceIds: ['Power'],
              status: [
                {
                  interfaceId: 'Power',
                  value: 'true',
                } as DeviceStatus,
              ] as GraphQlDevice['status'],
            } as GraphQlDevice,
          } as PrivateLightWidgetProps['data'])
        : undefined,
    }),
  ),
  graphql(
    gql`
      query($deviceId: String!, $interfaceIds: [String!]) {
        device(id: $deviceId) {
          id
          name
          interfaceIds
          status(interfaceIds: $interfaceIds) {
            id
            interfaceId
            statusId
            value
          }
        }
      }
    `,
    {skip: props => !props.deviceId},
  ),
  mapProps<PrivateLightWidgetProps, PrivateLightWidgetProps>(
    (props: PrivateLightWidgetProps): PrivateLightWidgetProps => ({
      ...props,
      status:
        props.data.device && asObject(props.data.device.status, 'interfaceId'),
    }),
  ),
  updateDeviceStatus(),
  withStateHandlers(
    {showDetail: false},
    {
      setShowDetail: (_, props: LightWidgetProps) => showDetail => {
        if (showDetail) {
          if (props.disableSort !== undefined)
            props.disableSort(props.config.deviceId)
        } else {
          if (props.enableSort !== undefined)
            props.enableSort(props.config.deviceId)
        }

        return {showDetail}
      },
    },
  ),
  withThrottledMutation<PrivateLightWidgetProps>(
    100,
    'status',
    'setDimmer',
    (value, {status, data: {device}, setDeviceStatus}) => {
      if (!status || !device) {
        throw Error('Device not loaded')
      }
      return setDeviceStatus(status.Dimmer.id, {
        deviceId: device.id,
        interfaceId: status.Dimmer.interfaceId,
        statusId: status.Dimmer.statusId,
        value,
      })
    },
    {
      mapValue: (value, {status}) =>
        updateIn(['Dimmer', 'value'], value, status!),
    },
  ),
  withThrottledMutation<PrivateLightWidgetProps>(
    100,
    'status',
    'setColor',
    (value, {status, data: {device}, setDeviceStatus}) => {
      if (!status || !device) {
        throw Error('Device not loaded')
      }
      return setDeviceStatus(status.Color.id, {
        deviceId: device.id,
        interfaceId: status.Color.interfaceId,
        statusId: status.Color.statusId,
        value: value.toString(),
      })
    },
    {
      mapValue: (value, {status}) =>
        updateIn(['Color', 'value'], value, status!),
    },
  ),
)

export const LightWidgetView = ({
  data: {device},
  status,
  setDeviceStatus,
  showDetail,
  setShowDetail,
  setDimmer,
  setColor,
}: PrivateLightWidgetProps) => {
  return (
    <Container onClick={() => setShowDetail(!showDetail)}>
      {device &&
        (showDetail &&
        status &&
        device.interfaceIds!.includes(defaultInterfaces.Dimmer.id) ? (
          <NameRow>
            <DeviceName>{device.name}</DeviceName>
            <DetailControl>
              <Slider
                style={{paddingRight: 16, height: 40}}
                value={+status.Dimmer.value}
                onChange={(_, value) => {
                  setDimmer(value)
                }}
                onDragStop={() => setTimeout(() => setShowDetail(false))}
                min={0}
                max={100}
              />
            </DetailControl>
          </NameRow>
        ) : (
          <NameRow>
            <DeviceName>{device.name}</DeviceName>
            {status ? (
              <NameRow
                onMouseDown={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
              >
                {device.interfaceIds!.includes(defaultInterfaces.Color.id) && (
                  <ColorPicker
                    value={+(status.Color || {}).value || 0}
                    onChange={setColor}
                  />
                )}
                <PowerSwitch
                  value={status.Power.value !== 'false'}
                  onChange={value => {
                    setDeviceStatus(status.Power.id, {
                      deviceId: device.id,
                      interfaceId: status.Power.interfaceId,
                      statusId: status.Power.statusId,
                      value: value.toString(),
                    })
                  }}
                />
              </NameRow>
            ) : (
              <div />
            )}
          </NameRow>
        ))}
    </Container>
  )
}

export const LightWidget: WidgetComponent<
  LightWidgetConfiguration,
  LightWidgetProps
> = Object.assign(enhance(LightWidgetView), {
  type: 'LightWidget',
  uiName: 'Light',
  defaultSize: {width: 4, height: 1},
  demoConfig: {deviceId: ''},
  config: {
    deviceId: {
      id: 'deviceId',
      type: 'device' as 'device',
      name: 'Device',
      interfaceIds,
      modifiable: true,
    },
  },
})
