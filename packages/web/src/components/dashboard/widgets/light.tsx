import Flexbox from 'flexbox-react'
import glamorous from 'glamorous'
import {DeviceStatus, GraphQlDevice, Interface} from 'raxa-common/lib/entities'
import React from 'react'
import {gql, graphql} from 'react-apollo'
import {QueryProps} from 'react-apollo/lib/graphql'
import {ContainerQuery} from 'react-container-query'
import {Slider} from 'react-toolbox/lib/slider'
import Switch from 'react-toolbox/lib/switch/Switch'
import {compose, mapProps, withState} from 'recompose'
import {updateIn} from 'redux-decorated'
import {
  UpdateDeviceStatusInjectedProps,
  updateDeviceStatus,
} from '../../../lib/mutations'
import {withThrottledMutation} from '../../../with-throttled-mutation'
import {WidgetComponent, WidgetProps} from '../widget'
import {DimButton, DimLevelButton} from './ui/light-button'

const Container = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
})
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

const interfaceIds = ['Light', 'Dimmer']

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
            interfaceIds: ['Light'],
            status: [
              {
                interfaceId: 'Light',
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
)

export const LightWidgetView = ({
  data: {device},
  status,
  setDeviceStatus,
  showDetail,
  setShowDetail,
  setDimmer,
}: PrivateLightWidgetProps) => {
  return (
    <ContainerQuery
      query={{
        thin: {
          maxHeight: 48,
        },
        long: {
          minWidth: 240,
        },
      }}
    >
      {({thin, long}) =>
        <Container>
          {device &&
            (showDetail && status
              ? <NameRow>
                  {long && <DeviceName>{device.name}</DeviceName>}
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
                    ? <Flexbox alignItems="center">
                        {long &&
                          device.interfaceIds!.includes('Dimmer') &&
                          <Flexbox>
                            <DimLevelButton
                              onClick={() => setDimmer('25')}
                              level={0.25}
                            />
                            <DimLevelButton
                              onClick={() => setDimmer('25')}
                              level={0.5}
                            />
                            <DimLevelButton
                              onClick={() => setDimmer('25')}
                              level={1}
                            />
                          </Flexbox>}
                        {thin &&
                          device.interfaceIds!.includes('Dimmer') &&
                          <DimButton onClick={() => setShowDetail(true)} />}
                        <PowerSwitch
                          checked={Boolean(status.Light.value)}
                          onChange={value => {
                            setDeviceStatus(status.Light.id, {
                              deviceId: device.id,
                              interfaceId: status.Light.interfaceId,
                              statusId: status.Light.statusId,
                              value: value.toString(),
                            })
                          }}
                        />
                      </Flexbox>
                    : <div />}
                </NameRow>)}
          {device &&
            status &&
            !thin &&
            device.interfaceIds!.includes('Dimmer') &&
            <Flexbox flexDirection="column">
              <Slider value={+status.Dimmer.value} onChange={setDimmer} />
            </Flexbox>}
        </Container>}
    </ContainerQuery>
  )
}

export const LightWidget: WidgetComponent<
  LightWidgetConfiguration
> = Object.assign(enhance(LightWidgetView), {
  type: 'LightWidget',
  uiName: 'Lamp',
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
