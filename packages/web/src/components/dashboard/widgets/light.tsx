import Flexbox from 'flexbox-react'
import glamorous from 'glamorous'
import {DeviceStatus, GraphQlDevice, Interface} from 'raxa-common/lib/entities'
import React from 'react'
import {gql, graphql} from 'react-apollo/lib'
import {QueryProps} from 'react-apollo/lib/graphql'
import {ContainerQuery} from 'react-container-query'
import {Slider} from 'react-toolbox/lib/slider'
import Switch from 'react-toolbox/lib/switch/Switch'
import {compose, mapProps} from 'recompose'
import {
  UpdateDeviceStatusInjectedProps,
  updateDeviceStatus,
} from '../../../lib/mutations'
import {WidgetComponent, WidgetProps} from '../widget'

const Container = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
})
const NameRow = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  height: 32,
})
const DeviceName = glamorous.span({
  flex: 1,
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

// function statusListAsObject(array: Iterable<DeviceStatus>): {[interfaceId: string]: {[statusId: string]: DeviceStatus}} {
//   const object = {}
//   for (const element of array) {
//     object[element.id] = element
//   }
//   return object
// }

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
)

export const LightWidgetView = ({
  data: {device},
  status,
  setDeviceStatus,
}: PrivateLightWidgetProps) => {
  function setDimmer(value: string) {
    if (!status || !device) return Promise.reject('Device not loaded')
    return setDeviceStatus(status.Dimmer.id, {
      deviceId: device.id,
      interfaceId: status.Dimmer.interfaceId,
      statusId: status.Dimmer.statusId,
      value,
    })
  }
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
            <NameRow>
              <DeviceName>{device.name}</DeviceName>
              {status
                ? <Flexbox alignItems="center">
                    {long && device.interfaceIds!.includes('Dimmer')
                      ? <Flexbox>
                          <button onChange={() => setDimmer('25')}>
                            25%
                          </button>
                          <button onChange={() => setDimmer('50')}>
                            50%
                          </button>
                          <button onChange={() => setDimmer('100')}>
                            100%
                          </button>
                        </Flexbox>
                      : <PowerSwitch
                          checked={Boolean(status.Light.value)}
                          onClick={() => {
                            setDeviceStatus(status.Light.id, {
                              deviceId: device.id,
                              interfaceId: status.Light.interfaceId,
                              statusId: status.Light.statusId,
                              value: (!Boolean(status.Light.value)).toString(),
                            })
                          }}
                        />}
                    {thin &&
                      device.interfaceIds!.includes('Dimmer') &&
                      <button>Dim</button>}
                  </Flexbox>
                : <div />}
            </NameRow>}
          {device &&
            status &&
            !thin &&
            device.interfaceIds!.includes('Dimmer') &&
            <Flexbox flexDirection="column">
              <Slider onChange={setDimmer} />
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
  defaultSize: {width: 2, height: 1},
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
