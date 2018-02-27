import glamorous from 'glamorous'
import {filter, first, flatMap, map} from 'iterates/lib/sync'
import {title} from 'material-definitions'
import Icon from 'material-ui/Icon'
import IconButton from 'material-ui/IconButton'
import MUIListSubheader from 'material-ui/List/ListSubheader'
import {GraphQlDevice} from 'raxa-common'
import React from 'react'
import {QueryProps, gql, graphql} from 'react-apollo'
import {ContextActions} from 'react-material-app'
import {compose, withState} from 'recompose'
import {compose as fnCompose} from 'redux'
import {row} from 'style-definitions'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {DeviceDetailSettings} from './device-detail'

const deviceTypeOther = 'Other'

const Title = glamorous.h3(title)
const ListHeader = glamorous.div({...row({vertical: 'center'}), flexShrink: 0})
const ListSubHeader = glamorous(MUIListSubheader, {filterProps: ['isMobile']})(
  ({isMobile}: {isMobile: boolean}) => ({
    paddingLeft: isMobile ? '' : '0 !important',
    'div + div>&': {
      margin: '0 !important',
      borderTop: isMobile ? `1px solid rgba(0, 0, 0, 0.12)` : '',
    },
  }),
)

export type DeviceSettingsProps = {}
export type ListGraphQlData = {devices: Array<GraphQlDevice>}
export type PrivateDeviceSettingsProps = DeviceSettingsProps &
  IsMobileProps & {
    data: ListGraphQlData & QueryProps
    newDevice?: DeviceOrHeader
    setNewDevice: (newDevice?: Partial<DeviceOrHeader>) => void
    createNewDevice: () => void
  }

export const deviceListQuery = gql`
  query {
    devices {
      id
      name
      config
      types
      deviceClass {
        id
        name
        config
      }
      interfaces {
        id
        name
        methods
      }
    }
  }
`

const enhance = compose<PrivateDeviceSettingsProps, DeviceSettingsProps>(
  graphql(deviceListQuery),
  withState('newDevice', 'setNewDevice', null),
  // Using withState instead of mapProps or withProps as we want to create only one
  // function instance isntead of a new one for every render to avoid infinite recursion
  // due to always changing context
  withState('createNewDevice', '', (props: PrivateDeviceSettingsProps) => () =>
    props.setNewDevice({type: 'device', value: {interfaces: []} as any}),
  ),
  withIsMobile,
)

type DeviceOrHeader =
  | {type: 'device'; value: GraphQlDevice}
  | {type: 'header'; value: string}

const groupDevices = (devices: Array<GraphQlDevice>): Array<DeviceOrHeader> => {
  const groups = new Map<string, Array<GraphQlDevice>>()

  for (const device of devices) {
    for (let type of device.types && device.types.length
      ? device.types
      : [deviceTypeOther]) {
      let devices = groups.get(type)
      if (!devices) {
        devices = []
        groups.set(type, devices)
      }
      devices.push(device)
    }
  }

  groups.forEach((devices, type) => {
    if (type !== deviceTypeOther && devices.length < 2 && groups.size > 1) {
      let others = groups.get(deviceTypeOther) || []
      groups.set(
        deviceTypeOther,
        others.concat(devices.filter(d => !others.some(o => d.id === o.id))),
      )
      groups.delete(type)
    }
  })

  if (groups.size === 1) {
    return [
      ...map(
        device => ({type: 'device' as 'device', value: device}),
        first(groups.values())!,
      ),
    ]
  }

  return [
    ...fnCompose(
      flatMap(([type, devices]) => [
        {type: 'header' as 'header', value: type},
        ...devices.map(device => ({type: 'device' as 'device', value: device})),
      ]),
      map(
        (type: string) =>
          [type, groups.get(type)!] as [string, Array<GraphQlDevice>],
      ),
      filter((type: string) => groups.has(type)),
    )(groups.keys()),
  ]
}

const DeviceList = ListDetail as React.StatelessComponent<
  ListDetailProps<DeviceOrHeader, PrivateDeviceSettingsProps['data']>
>

export const DeviceSettingsView = ({
  data,
  newDevice,
  createNewDevice,
  setNewDevice,
  isMobile,
}: PrivateDeviceSettingsProps) => (
  <DeviceList
    path="/settings/devices"
    data={data}
    getItems={data => groupDevices(data.devices || [])}
    getSection={item =>
      item.type === 'device'
        ? {
            title: item.value.name,
            path: `/settings/devices/${item.value.id}`,
          }
        : null
    }
    renderItem={(item, _, index) =>
      item.type === 'device' ? (
        <ListItem key={index} caption={item.value.name} />
      ) : (
        <div key={index}>
          <ListSubHeader isMobile={isMobile}>{item.value}</ListSubHeader>
        </div>
      )
    }
    renderActiveItem={item =>
      item.type === 'device' ? (
        <DeviceDetailSettings device={item.value} />
      ) : null
    }
    activeItem={
      newDevice && {
        item: newDevice,
        section: {
          title: 'New Device',
          path: '/settings/devices/new',
          onUnload: () => setNewDevice(undefined),
        },
      }
    }
    listHeader={
      isMobile ? (
        <ContextActions
          contextActions={[
            {
              icon: 'add',
              onClick: createNewDevice,
              to: '/settings/devices/new',
            },
          ]}
        />
      ) : (
        <ListHeader>
          <Title style={{flex: 1}}>Devices</Title>
          <IconButton onClick={createNewDevice}>
            <Icon>add</Icon>
          </IconButton>
        </ListHeader>
      )
    }
  />
)

export const DeviceSettings = enhance(DeviceSettingsView)
