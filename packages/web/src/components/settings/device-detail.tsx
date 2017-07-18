import {flatten} from 'ramda'
import {
  Device,
  GraphQlDevice,
  GraphQlDeviceClass,
  Method,
} from 'raxa-common/lib/entities'
import React from 'react'
import {gql, graphql} from 'react-apollo'
import {QueryProps} from 'react-apollo/lib/graphql'
import Button from 'react-toolbox/lib/button/Button'
import {
  List,
  ListItem as ToolboxListItem,
  ListSubHeader,
} from 'react-toolbox/lib/list'
import {compose, mapProps, withState} from 'recompose'
import {Title} from 'styled-material/dist/src/typography'
import {
  CallDeviceInjectedProps,
  callDevice,
  updateDeviceStatus,
} from '../../lib/mutations'
import {PropertyView} from '../properties/property'
import {StatusView} from '../properties/status'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {SettingForm} from '../ui/setting-form'
import {SettingDropdown} from '../ui/setting-input'

export type DeviceDetailSettingsProps = {
  device: GraphQlDevice
}
export type GraphqlDataS = {
  device: GraphQlDevice
}
export type PrivateDeviceDetailSettingsProps = DeviceDetailSettingsProps &
  IsMobileProps &
  CallDeviceInjectedProps & {
    data: {
      device?: GraphQlDevice
      deviceClasses?: Array<GraphQlDeviceClass>
    } & QueryProps
    saveDevice: (device: Device) => Promise<any>
    deviceId: string
    tmpDevice: GraphQlDevice
    onChange: (device: GraphQlDevice) => void
    methods: Array<Method & {interfaceId: string}>
  }

const enhance = compose(
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
  mapProps((props: PrivateDeviceDetailSettingsProps) => ({
    ...props,
    methods: flatten(
      props.tmpDevice.interfaces.map(
        iface =>
          iface.methods
            ? Object.values(iface.methods).map(method => ({
                ...method,
                interfaceId: iface.id,
              }))
            : [],
      ),
    ).filter(m => m.showInSettings),
  })),
  withIsMobile,
  callDevice(),
)

export const DeviceDetailSettingsView = ({
  data,
  tmpDevice: device,
  onChange,
  saveDevice,
  isMobile,
  methods,
  callDevice,
}: PrivateDeviceDetailSettingsProps) =>
  <List>
    {!isMobile && <Title>{device.id ? device.name : 'New Device'}</Title>}
    {device.id &&
      <ToolboxListItem caption="Type" legend={device.deviceClass.name} />}
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
    {methods.length > 0 &&
      [<ListSubHeader key={2} caption="Actions" />].concat(
        methods.map(method =>
          <Button
            key={`${method.interfaceId}:${method.id}`}
            onClick={() =>
              callDevice({
                deviceId: device.id,
                interfaceId: method.interfaceId,
                method: method.id,
                arguments: {},
              })}
          >
            {method.name || method.id}
          </Button>,
        ),
      )}
    {data &&
    data.device &&
    data.device.status &&
    data.device.status.length > 0 && [
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

export const DeviceDetailSettings = enhance(
  DeviceDetailSettingsView,
) as React.ComponentClass<DeviceDetailSettingsProps>
