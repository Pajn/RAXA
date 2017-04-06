import {Device, GraphQlDevice} from 'raxa-common/lib/entities'
import * as React from 'react'
import {InjectedGraphQLProps, gql, graphql} from 'react-apollo/lib'
import {List, ListDivider, ListItem as ToolboxListItem, ListSubHeader} from 'react-toolbox/lib/list'
import compose from 'recompose/compose'
import mapProps from 'recompose/mapProps'
import {Title} from 'styled-material/dist/src/typography'
import {PropertyView} from '../properties/property'
import {StatusView} from '../properties/status'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {SettingForm} from '../ui/setting-form'

export type DeviceDetailSettingsProps = {
  device: GraphQlDevice
}
export type GraphqlDataS = {
  device: GraphQlDevice
}
export type PrivateDeviceDetailSettingsProps = DeviceDetailSettingsProps & InjectedGraphQLProps<GraphqlDataS> &
  IsMobileProps & {
  saveDevice: (device: Device) => Promise<any>
}

const enhanceS = compose(
  mapProps((props: DeviceDetailSettingsProps) => ({
    ...props,
    deviceId: props.device.id,
  })),
  graphql(gql`
    query($deviceId: String!) {
      device(id: $deviceId) {
        id
        status {
          id
          interfaceId
          statusId
          value
        }
      }
    }
  `),
  graphql(gql`
    mutation($device: DeviceInput!) {
      upsertDevice(device: $device) {
        id
        name
        config
      }
    }
  `, {
    props: ({mutate}) => ({
      saveDevice(device: Device) {
        return mutate({variables: {device: {
          id: device.id,
          name: device.name,
          config: device.config,
        }}})
      }
    })
  }),
  withIsMobile,
)

export const DeviceDetailSettingsView = ({data, device, saveDevice, isMobile}: PrivateDeviceDetailSettingsProps) =>
  <List>
    {!isMobile &&
      <Title>{device.name}</Title>
    }
    <ToolboxListItem
      caption="Type"
      legend={device.deviceClass.name}
    />
    <ListDivider />
    <ListSubHeader caption="Properties" />
    <SettingForm
      value={device}
      fields={[
        {
          path: ['name'],
          label: 'Name',
        },
        ...Object.entries(device.deviceClass.config!).map(([id, config]) => ({
          path: ['config', id],
          component: PropertyView,
          label: id,
          property: config,
        }))
      ]}
      onSave={saveDevice}
    />
    {data && data.device && data.device.status && data.device.status.length > 0 && [
      <ListDivider key={1} />,
      <ListSubHeader key={2} caption="Status" />,
      data.device.status.map(status =>
        <StatusView
          key={status.id}
          id={status.id}
          label={status.statusId}
          deviceId={device.id}
          interfaceId={status.interfaceId}
          statusId={status.statusId}
          value={status.value}
        />
      ),
    ]}
  </List>

export const DeviceDetailSettings = enhanceS(DeviceDetailSettingsView) as React.ComponentClass<DeviceDetailSettingsProps>

export type DeviceSettingsProps = {}
export type GraphqlData = {
  devices: Array<GraphQlDevice>
}
export type PrivateDeviceSettingsProps = DeviceSettingsProps & InjectedGraphQLProps<GraphqlData> & {
}

const enhance = compose(
  graphql(gql`
    query {
      devices {
        id
        name
        config
        deviceClass {
          id
          name
          config
        }
      }
    }
  `),
)

const DeviceList = ListDetail as React.StatelessComponent<ListDetailProps<GraphQlDevice, GraphqlData>>

export const DeviceSettingsView = ({data}: PrivateDeviceSettingsProps) =>
  <DeviceList
    path="/settings/devices"
    data={data}
    getItems={data => data.devices as any}
    getSection={device => ({title: device.name, path: `/settings/devices/${device.id}`})}
    renderItem={device => <ListItem key={device.id} caption={device.name} />}
    renderActiveItem={device => <DeviceDetailSettings device={device} />}
  />

export const DeviceSettings = enhance(DeviceSettingsView) as React.ComponentClass<DeviceSettingsProps>
