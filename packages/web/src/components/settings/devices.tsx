import Flexbox from 'flexbox-react'
import {
  Device,
  GraphQlDevice,
  GraphQlDeviceClass,
} from 'raxa-common/lib/entities'
import React from 'react'
import {gql, graphql} from 'react-apollo'
import {QueryProps} from 'react-apollo/lib/graphql'
import BadIconButton from 'react-toolbox/lib/button/IconButton'
import {
  List,
  ListDivider,
  ListItem as ToolboxListItem,
  ListSubHeader,
} from 'react-toolbox/lib/list'
import compose from 'recompose/compose'
import mapProps from 'recompose/mapProps'
import withState from 'recompose/withState'
import {Title} from 'styled-material/dist/src/typography'
import {PropertyView} from '../properties/property'
import {StatusView} from '../properties/status'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {SettingForm} from '../ui/setting-form'
import {SettingDropdown} from '../ui/setting-input'

const IconButton: any = BadIconButton

export type DeviceDetailSettingsProps = {
  device: GraphQlDevice
}
export type GraphqlDataS = {
  device: GraphQlDevice
}
export type PrivateDeviceDetailSettingsProps = DeviceDetailSettingsProps &
  IsMobileProps & {
    data: {
      device?: GraphQlDevice
      deviceClasses?: Array<GraphQlDeviceClass>
    } & QueryProps
    saveDevice: (device: Device) => Promise<any>
    deviceId: string
    tmpDevice: GraphQlDevice
    onChange: (device: GraphQlDevice) => void
  }

const enhanceS = compose(
  mapProps((props: DeviceDetailSettingsProps) => ({
    ...props,
    deviceId: props.device.id,
  })),
  graphql(
    gql`
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
    `,
    {skip: ({deviceId}) => !deviceId},
  ),
  graphql(
    gql`
      query {
        deviceClasses(allowManualCreation: true) {
          id
          name
          pluginId
          config
        }
      }
    `,
    {skip: ({deviceId}) => !!deviceId},
  ),
  withState('tmpDevice', 'onChange', ({device}) => device),
  graphql(
    gql`
      mutation($device: DeviceInput!) {
        upsertDevice(device: $device) {
          id
          name
          config
        }
      }
    `,
    {
      props: ({mutate}) => ({
        saveDevice(device: Device) {
          return mutate!({
            variables: {
              device: {
                id: device.id,
                name: device.name,
                deviceClassId: device.deviceClassId,
                pluginId: device.pluginId,
                config: device.config,
              },
            },
          })
        },
      }),
    },
  ),
  withIsMobile,
)

export const DeviceDetailSettingsView = ({
  data,
  tmpDevice: device,
  onChange,
  saveDevice,
  isMobile,
}: PrivateDeviceDetailSettingsProps) =>
  <List>
    {!isMobile && <Title>{device.id ? device.name : 'New Device'}</Title>}
    {device.id &&
      <ToolboxListItem caption="Type" legend={device.deviceClass.name} />}
    {device.id && <ListDivider />}
    <ListSubHeader caption="Properties" />
    <SettingForm
      value={device}
      fields={[
        !device.id && {
          component: SettingDropdown,
          path: ['deviceClassId'],
          label: 'Type',
          source: (data.deviceClasses || []).map(deviceClass => ({
            label: deviceClass.name,
            value: deviceClass.id,
          })),
          required: true,
          onChange(updatedDevice: GraphQlDevice) {
            const deviceClass =
              data.deviceClasses &&
              data.deviceClasses.find(
                deviceClass => deviceClass.id === updatedDevice.deviceClassId,
              )
            return {
              ...updatedDevice,
              deviceClass,
              pluginId: deviceClass && deviceClass.pluginId,
              config: {},
            }
          },
        },
        {
          path: ['name'],
          label: 'Name',
          required: true,
        },
        ...(device.deviceClass
          ? Object.entries(device.deviceClass.config!).map(([id, config]) => ({
              path: ['config', id],
              component: PropertyView,
              label: id,
              property: config,
              required: !config.optional && config.modifiable,
            }))
          : []),
      ]}
      onSave={saveDevice}
      onChange={device => onChange(device)}
    />
    {data &&
    data.device &&
    data.device.status &&
    data.device.status.length > 0 && [
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
        />,
      ),
    ]}
  </List>

export const DeviceDetailSettings = enhanceS(
  DeviceDetailSettingsView,
) as React.ComponentClass<DeviceDetailSettingsProps>

export type DeviceSettingsProps = {}
export type ListGraphQlData = {devices: Array<GraphQlDevice>}
export type PrivateDeviceSettingsProps = DeviceSettingsProps & {
  data: ListGraphQlData & QueryProps
  newDevice?: GraphQlDevice
  setNewDevice: (newDevice?: Partial<GraphQlDevice>) => void
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
  withState('newDevice', 'setNewDevice', null),
)

const DeviceList = ListDetail as React.StatelessComponent<
  ListDetailProps<GraphQlDevice, PrivateDeviceSettingsProps['data']>
>

export const DeviceSettingsView = ({
  data,
  newDevice,
  setNewDevice,
}: PrivateDeviceSettingsProps) =>
  <DeviceList
    path="/settings/devices"
    data={data}
    getItems={data => data.devices || []}
    getSection={device => ({
      title: device.name,
      path: `/settings/devices/${device.id}`,
    })}
    renderItem={device => <ListItem key={device.id} caption={device.name} />}
    renderActiveItem={device => <DeviceDetailSettings device={device} />}
    activeItem={
      newDevice && {
        item: newDevice,
        section: {title: 'New Device', path: '/settings/devices'},
      }
    }
    listHeader={
      <Flexbox alignItems="center">
        <Title style={{flex: 1}}>Devices</Title>
        <IconButton icon="add" onClick={() => setNewDevice({})} />
      </Flexbox>
    }
  />

export const DeviceSettings = enhance(
  DeviceSettingsView,
) as React.ComponentClass<DeviceSettingsProps>
