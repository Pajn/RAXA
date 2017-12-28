import glamorous from 'glamorous'
import {filter, flatMap, map} from 'iterates/lib/sync'
import {title} from 'material-definitions'
import {GraphQlDevice} from 'raxa-common'
import React from 'react'
import {QueryProps, gql, graphql} from 'react-apollo'
import BadIconButton from 'react-toolbox/lib/button/IconButton'
import BadListSubHeader from 'react-toolbox/lib/list/ListSubHeader'
import {compose, withState} from 'recompose'
import {compose as fnCompose} from 'redux'
import {row} from 'style-definitions'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {ContextActions} from '../ui/scaffold/context-actions'
import {DeviceDetailSettings} from './device-detail'

const IconButton: any = BadIconButton

const deviceTypeOther = 'Other'

const Title = glamorous.h3(title)
const ListHeader = glamorous.div({...row({vertical: 'center'}), flexShrink: 0})
const ListSubHeader = glamorous(
  (BadListSubHeader as any) as (typeof BadListSubHeader)['ListSubHeader'],
)(({isMobile}: {isMobile: boolean}) => ({
  paddingLeft: isMobile ? '' : '0 !important',
  'div + div>&': {
    margin: '0 !important',
    borderTop: isMobile ? `1px solid rgba(0, 0, 0, 0.12)` : '',
  },
}))

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
    if (devices.length < 2) {
      let others = groups.get(deviceTypeOther)
      if (!others) {
        others = []
        groups.set(deviceTypeOther, others)
      }
      others.concat(devices)
      groups.delete(type)
    }
  })

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
        : null}
    renderItem={(item, _, index) =>
      item.type === 'device' ? (
        <ListItem key={index} caption={item.value.name} />
      ) : (
        <div key={index}>
          <ListSubHeader caption={item.value} isMobile={isMobile} />
        </div>
      )}
    renderActiveItem={item =>
      item.type === 'device' ? (
        <DeviceDetailSettings device={item.value} />
      ) : null}
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
              href: '/settings/devices/new',
            },
          ]}
        />
      ) : (
        <ListHeader>
          <Title style={{flex: 1}}>Devices</Title>
          <IconButton icon="add" onClick={createNewDevice} />
        </ListHeader>
      )
    }
  />
)

export const DeviceSettings = enhance(DeviceSettingsView)
