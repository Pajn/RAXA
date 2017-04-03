import {GraphQlDevice} from 'raxa-common/lib/entities'
import * as React from 'react'
import {InjectedGraphQLProps, compose, gql, graphql} from 'react-apollo/lib'
import {FormHelper} from 'react-form-helper'
import {List, ListSubHeader} from 'react-toolbox/lib/list'
import {StatusView} from '../properties/status'
import {PropertyView} from '../properties/property'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {SettingInput} from '../ui/setting-input'
import {ListItem} from '../ui/list'

export type DeviceSettingsProps = {}
export type GraphqlData = {
  devices: Array<GraphQlDevice>
}
export type PrivateDeviceSettingsProps = DeviceSettingsProps & InjectedGraphQLProps<GraphqlData>

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
  `)
)

const DeviceList = ListDetail as React.StatelessComponent<ListDetailProps<GraphQlDevice, GraphqlData>>

export const DeviceSettingsView = ({data}: PrivateDeviceSettingsProps) =>
  <DeviceList
    data={data}
    getItems={data => data.devices as any}
    renderItem={device => <ListItem caption={device.name} />}
    renderActiveItem={device =>
      <List>
        <div>
          {device.name}
        </div>
        <div>
          type: {device.deviceClass.name}
        </div>
        <ListSubHeader caption='Properties' />
        <FormHelper
          value={device}
          inputComponent={SettingInput}
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
          onSave={() => {}}
          saveButton='Save'
        />
        <ListSubHeader caption='Status' />
        {device.status && device.status.map(status =>
          <li>
            <StatusView
              label={status.statusId}
              deviceId={device.id}
              interfaceId={status.interfaceId}
              statusId={status.statusId}
              value={status.value}
            />
          </li>
        )}
      </List>
    }
  />

export const DeviceSettings = enhance(DeviceSettingsView)
