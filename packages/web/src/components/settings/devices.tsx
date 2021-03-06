import IconButton from '@material-ui/core/IconButton'
import MUIListSubheader from '@material-ui/core/ListSubheader'
import AddIcon from '@material-ui/icons/Add'
import gql from 'graphql-tag'
import {filter, first, flatMap, map, sort} from 'iterates/lib/sync'
import {pipeValue, tuple} from 'iterates/lib/utils'
import {title} from 'material-definitions'
import {DeviceType, GraphQlDevice} from 'raxa-common/lib/entities'
import React from 'react'
import {graphql} from 'react-apollo/graphql'
import {DataProps} from 'react-apollo/types'
import styled from 'react-emotion'
import {ContextActions} from 'react-material-app/lib/scaffold/ContextActions'
import {Section} from 'react-material-app/lib/scaffold/Section'
import {Route, withRouter} from 'react-router'
import {Link} from 'react-router-dom'
import {compose, withStateHandlers} from 'recompose'
import {row} from 'style-definitions'
import {Theme} from '../../theme'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {DeviceDetailSettings} from './device-detail'

declare module '@material-ui/core/IconButton/IconButton' {
  interface IconButtonProps {
    to?: string
  }
}

const deviceTypeOther = 'Other'
const deviceTypeOrder: Record<string, number | undefined> = {
  [DeviceType.Scenery]: 1,
  [DeviceType.Group]: 2,
  [DeviceType.Light]: 3,
  [DeviceType.Outlet]: 4,
  [DeviceType.Thermometer]: 5,
  [DeviceType.Media]: 6,
  [DeviceType.Automation]: 7,
  [DeviceType.Connector]: 8,
  [deviceTypeOther]: Infinity,
}

const Title = styled('h3')(title)
const ListHeader = styled('div')({...row({vertical: 'center'}), flexShrink: 0})
const ListSubHeader = styled(MUIListSubheader, {
  shouldForwardProp: prop => prop !== 'isMobile',
})<{isMobile: boolean}, Theme>(({isMobile}) => ({
  paddingLeft: isMobile ? '' : '0 !important',

  'div + div>&': {
    margin: 0,
    borderTop: isMobile ? `1px solid rgba(0, 0, 0, 0.12)` : '',
  },
}))

export type DeviceSettingsProps = {}
export type ListGraphQlData = {devices: Array<GraphQlDevice>}
export type PrivateDeviceSettingsProps = DeviceSettingsProps &
  IsMobileProps &
  DataProps<ListGraphQlData> & {
    newDevice?: DeviceOrHeader
    createNewDevice: () => void
    clearNewDevice: () => void
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
  // Inject the location to avoid sCU in withStateHandlers blocking <Route> changes
  withRouter,
  withStateHandlers(
    {newDevice: null as null | DeviceOrHeader},
    {
      clearNewDevice: () => () => ({newDevice: null}),
      createNewDevice: () => () => ({
        newDevice: {
          type: 'device' as 'device',
          value: {interfaces: []} as any,
        },
      }),
    },
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
    ...pipeValue(
      groups.keys(),
      filter(type => groups.has(type)),
      sort((a, b) => (deviceTypeOrder[a] || 99) - (deviceTypeOrder[b] || 99)),
      map(type => tuple([type, groups.get(type)!])),
      flatMap(([type, devices]) => [
        {type: 'header' as 'header', value: type},
        ...devices.map(device => ({type: 'device' as 'device', value: device})),
      ]),
    ),
  ]
}

const DeviceList = ListDetail as React.StatelessComponent<
  ListDetailProps<DeviceOrHeader, PrivateDeviceSettingsProps['data']>
>

export const DeviceSettingsView = ({
  data,
  newDevice,
  createNewDevice,
  clearNewDevice,
  isMobile,
}: PrivateDeviceSettingsProps) => (
  <>
    {isMobile ? (
      <Route
        path="/settings/devices/new"
        children={({match}) => {
          if (match && !newDevice) setTimeout(createNewDevice)
          return null
        }}
      />
    ) : (
      <Route
        path="/settings/devices/new"
        children={({match}) => {
          if (match && !newDevice) setTimeout(createNewDevice)
          return match ? (
            <Section
              title="New Device"
              path="/settings/devices/new"
              onUnload={clearNewDevice}
            />
          ) : null
        }}
      />
    )}
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
          <ListItem key={index} caption={item.value.name} button />
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
            onUnload: clearNewDevice,
          },
        }
      }
      listHeader={
        isMobile ? (
          <ContextActions
            contextActions={[
              {
                icon: <AddIcon />,
                onClick: createNewDevice,
                to: '/settings/devices/new',
              },
            ]}
          />
        ) : (
          <ListHeader>
            <Title style={{flex: 1}}>Devices</Title>
            <IconButton
              onClick={createNewDevice}
              component={Link as any}
              to="/settings/devices/new"
            >
              <AddIcon />
            </IconButton>
          </ListHeader>
        )
      }
    />
  </>
)

export const DeviceSettings = enhance(DeviceSettingsView)
