import {Device, GraphQlDevice} from 'raxa-common/lib/entities'
import * as React from 'react'
import {InjectedGraphQLProps, compose, gql, graphql} from 'react-apollo/lib'
import {List, ListDivider, ListItem as ToolboxListItem, ListSubHeader} from 'react-toolbox/lib/list'
import {PropertyView} from '../properties/property'
import {StatusView} from '../properties/status'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {SettingForm} from '../ui/setting-form'

export type DeviceSettingsProps = {}
export type GraphqlData = {
  devices: Array<GraphQlDevice>
}
export type PrivateDeviceSettingsProps = DeviceSettingsProps & InjectedGraphQLProps<GraphqlData> & {
  saveDevice: (device: Device) => Promise<any>
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
)

const DeviceList = ListDetail as React.StatelessComponent<ListDetailProps<GraphQlDevice, GraphqlData>>

export const DeviceSettingsView = ({data, saveDevice}: PrivateDeviceSettingsProps) =>
  <DeviceList
    data={data}
    getItems={data => data.devices as any}
    getTitle={device => device.name}
    renderItem={device => <ListItem caption={device.name} />}
    renderActiveItem={device =>
      <List>
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
        {device.status && device.status.length > 0 && [
          <ListDivider key={1} />,
          <ListSubHeader key={2} caption="Status" />,
          device.status.map(status =>
            <StatusView
              key={status.id}
              label={status.statusId}
              deviceId={device.id}
              interfaceId={status.interfaceId}
              statusId={status.statusId}
              value={status.value}
            />
          ),
        ]}
      </List>
    }
  />

export const DeviceSettings = enhance(DeviceSettingsView)
