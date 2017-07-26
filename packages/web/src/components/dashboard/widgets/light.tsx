import glamorous from 'glamorous'
import {
  DeviceStatus,
  GraphQlDevice,
  Interface,
  defaultInterfaces,
} from 'raxa-common'
import React from 'react'
import {QueryProps, gql, graphql} from 'react-apollo'
import Ripple from 'react-toolbox/lib/ripple'
import {Slider} from 'react-toolbox/lib/slider'
import Switch from 'react-toolbox/lib/switch/Switch'
import {compose, mapProps, withState} from 'recompose'
import {updateIn} from 'redux-decorated'
import {
  UpdateDeviceStatusInjectedProps,
  updateDeviceStatus,
} from '../../../lib/mutations'
import {withThrottledMutation} from '../../../with-throttled-mutation'
import {ColorPicker} from '../../ui/color-picker'
import {WidgetComponent, WidgetProps} from '../widget'

const Container = Ripple({})(
  glamorous.div({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  }),
)
const NameRow = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  height: 40,
})
const DeviceName = glamorous.span({
  flexGrow: 1,
})
const DetailControl = glamorous.span({
  flex: 10,
})
const PowerSwitch = glamorous(Switch)({
  flexShrink: 0,
  ':not(#id)': {marginBottom: 5},
})

const interfaceIds = [
  defaultInterfaces.Power.id,
  defaultInterfaces.Dimmer.id,
  defaultInterfaces.Color.id,
]

export type LightWidgetConfiguration = {
  deviceId: string
}
export type LightWidgetProps = WidgetProps<LightWidgetConfiguration>
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
  mapProps<Partial<PrivateLightWidgetProps>, LightWidgetProps>(({config}) => ({
    config,
    deviceId: config.deviceId,
    interfaceIds,
    data: !config.deviceId
      ? {
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
        } as PrivateLightWidgetProps['data']
      : undefined,
  })),
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
  mapProps<
    PrivateLightWidgetProps,
    PrivateLightWidgetProps
  >((props: PrivateLightWidgetProps): PrivateLightWidgetProps => ({
    ...props,
    status:
      props.data.device && asObject(props.data.device.status, 'interfaceId'),
  })),
  updateDeviceStatus(),
  withState('showDetail', 'setShowDetail', false),
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
          device.interfaceIds!.includes(defaultInterfaces.Dimmer.id)
          ? <NameRow>
              <DeviceName>{device.name}</DeviceName>
              <DetailControl>
                <Slider
                  value={+status.Dimmer.value}
                  onChange={setDimmer}
                  onDragStop={() => setShowDetail(false)}
                />
              </DetailControl>
            </NameRow>
          : <NameRow>
              <DeviceName>{device.name}</DeviceName>
              {status
                ? <NameRow
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                  >
                    {device.interfaceIds!.includes(
                      defaultInterfaces.Color.id,
                    ) &&
                      <ColorPicker
                        value={+(status.Color || {}).value || 0}
                        onChange={setColor}
                      />}
                    <PowerSwitch
                      checked={status.Power.value !== 'false'}
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
                : <div />}
            </NameRow>)}
    </Container>
  )
}

export const LightWidget: WidgetComponent<
  LightWidgetConfiguration
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
