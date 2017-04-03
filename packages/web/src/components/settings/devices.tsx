import {GraphQlDevice} from 'raxa-common/lib/entities'
import * as React from 'react'
import {InjectedGraphQLProps, compose, gql, graphql} from 'react-apollo/lib'
import {FormHelper} from 'react-form-helper'
import {StatusView} from '../properties/status'
import {PropertyView} from '../properties/property'
import {ListDetail, ListDetailProps} from '../ui/list-detail'

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
    renderItem={(device, activate) =>
      <li onClick={activate}>
        {device.name}
      </li>
    }
    renderActiveItem={device =>
      <div>
        {device.name}
        <div>
          type: {device.deviceClass.name}
        </div>
        <h5>Properties</h5>
        <FormHelper
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
          onSave={() => {}}
          saveButton='Save'
        />
        Status
        <ul>
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
        </ul>
      </div>
    }
  />

export const DeviceSettings = enhance(DeviceSettingsView)
