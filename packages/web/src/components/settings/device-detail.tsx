import glamorous from 'glamorous'
import gql from 'graphql-tag'
import {title} from 'material-definitions'
import List, {ListItem, ListItemText} from 'material-ui/List'
import ListSubheader from 'material-ui/List/ListSubheader'
import {flatten} from 'ramda'
import {
  Device,
  GraphQlDevice,
  GraphQlDeviceClass,
  Method,
} from 'raxa-common/lib/entities'
import {DeviceIsInUseError, isRaxaError} from 'raxa-common/lib/errors'
import React from 'react'
import {DataProps, MutateProps, graphql} from 'react-apollo'
import {ProgressButton} from 'react-material-app'
import {Dispatch, connect} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router'
import {compose, lifecycle, mapProps, withState} from 'recompose'
import {action} from 'redux-decorated'
import {CallDeviceInjectedProps, callDevice} from '../../lib/mutations'
import {actions} from '../../redux-snackbar/actions'
import {PropertyView} from '../properties/property'
import {StatusView} from '../properties/status'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {SettingForm} from '../ui/setting-form'
import {SettingDropdown} from '../ui/setting-input'
import {deviceListQuery} from './devices'

const Title = glamorous.h3(title)

export type DeviceDetailSettingsProps = {
  device: GraphQlDevice
}
export type GraphqlData = {
  device: GraphQlDevice
}
export type PrivateDeviceDetailSettingsProps = DeviceDetailSettingsProps &
  IsMobileProps &
  CallDeviceInjectedProps &
  RouteComponentProps<any> &
  DataProps<{
    device?: GraphQlDevice
    deviceClasses?: Array<GraphQlDeviceClass>
  }> &
  MutateProps<{
    device?: GraphQlDevice
    deviceClasses?: Array<GraphQlDeviceClass>
  }> & {
    dispatch: Dispatch
    saveDevice: (device: Device) => Promise<any>
    removeDevice: (device: Device) => Promise<any>
    deleteDevice: () => Promise<any>
    deviceId: string
    tmpDevice: GraphQlDevice
    onChange: (device: GraphQlDevice) => void
    methods: Array<Method & {interfaceId: string}>
  }

const enhance = compose(
  withRouter,
  connect(),
  mapProps((props: DeviceDetailSettingsProps) => ({
    ...props,
    deviceId: props.device.id,
  })),
  withState('tmpDevice', 'onChange', ({device}) => device),
  graphql<PrivateDeviceDetailSettingsProps, {device: GraphQlDevice}>(
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
    {
      skip: ({deviceId}) => !!deviceId,
      options: {fetchPolicy: 'cache-and-network'},
    },
  ),
  graphql<
    PrivateDeviceDetailSettingsProps,
    {upsertDevice: GraphQlDevice},
    {device: Device},
    Partial<PrivateDeviceDetailSettingsProps>
  >(
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
      props: ({mutate, ownProps: {history, dispatch}}) => ({
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
            refetchQueries: device.id ? [] : [{query: deviceListQuery}],
          })
            .then(data => {
              if (!device.id) {
                history.replace(
                  `/settings/devices/${data.data.upsertDevice.id}`,
                )
              }
              dispatch(
                action(actions.showSnackbar, {
                  label: `Sucessfully saved device ${device.name}`,
                  type: 'accept' as 'accept',
                }),
              )
            })
            .catch(e => {
              dispatch(
                action(actions.showSnackbar, {
                  label: `Failed to save device`,
                  type: 'warning' as 'warning',
                }),
              )
              throw e
            })
        },
      }),
    },
  ),
  graphql<
    PrivateDeviceDetailSettingsProps,
    {removeDevice: GraphQlDevice},
    {deviceId: string},
    Partial<PrivateDeviceDetailSettingsProps>
  >(
    gql`
      mutation($deviceId: String!) {
        removeDevice(id: $deviceId) {
          id
        }
      }
    `,
    {
      props: ({mutate, ownProps: {history, dispatch}}) => ({
        removeDevice(device: Device) {
          return mutate!({
            variables: {
              deviceId: device.id,
            },
            refetchQueries: [{query: deviceListQuery}],
          })
            .then(() => {
              history.replace(`/settings/devices`)
              dispatch(
                action(actions.showSnackbar, {
                  label: `Sucessfully deleted device ${device.name}`,
                  type: 'accept' as 'accept',
                }),
              )
            })
            .catch(e => {
              if (isRaxaError(e)) {
                if (e.type === 'deviceIsInUse') {
                  dispatch(
                    action(actions.showSnackbar, {
                      label: `Failed to delete device. Device is in use by ${(e as DeviceIsInUseError).devices
                        .map(d => d.name)
                        .join(', ')}`,
                      type: 'warning' as 'warning',
                    }),
                  )
                }
              } else {
                dispatch(
                  action(actions.showSnackbar, {
                    label: `Failed to delete device`,
                    type: 'warning' as 'warning',
                  }),
                )
              }
              throw e
            })
        },
      }),
    },
  ),
  withState(
    'deleteDevice',
    '',
    (props: PrivateDeviceDetailSettingsProps) => () =>
      props.removeDevice(props.device),
  ),
  mapProps((props: PrivateDeviceDetailSettingsProps) => ({
    ...props,
    methods: flatten<Method>(
      props.tmpDevice.interfaces.map(
        iface =>
          iface.methods
            ? Object.values(iface.methods).map(method => ({
                ...method,
                interfaceId: iface.id,
              }))
            : ([] as Array<Method>),
      ),
    ).filter(m => m.showInSettings),
  })),
  withIsMobile,
  callDevice(),
  lifecycle<PrivateDeviceDetailSettingsProps, PrivateDeviceDetailSettingsProps>(
    {
      componentDidMount() {
        if (this.props.deviceId) {
          ;(this as any).unsubscribe = this.props.data.subscribeToMore({
            document: gql`
              subscription deviceUpdated($deviceId: String!) {
                deviceUpdated(id: $deviceId) {
                  config
                }
              }
            `,
            variables: {deviceId: this.props.deviceId},
            updateQuery: (prev, {subscriptionData}) => {
              if (
                subscriptionData.data &&
                subscriptionData.data.deviceUpdated
              ) {
                const config = subscriptionData.data.deviceUpdated.config
                this.props.onChange((device => ({...device, config})) as any)
              }
              return prev
            },
          })
        }
      },

      componentWillUnmount(this: any) {
        if (this.unsubscribe !== undefined) {
          this.unsubscribe()
        }
      },
    },
  ),
)

export const DeviceDetailSettingsView = ({
  data,
  tmpDevice: device,
  onChange,
  saveDevice,
  deleteDevice,
  isMobile,
  methods,
  callDevice,
}: PrivateDeviceDetailSettingsProps) => (
  <List>
    {!isMobile && <Title>{device.id ? device.name : 'New Device'}</Title>}
    {device.id && (
      <ListItem>
        <ListItemText primary="Type" secondary={device.deviceClass.name} />
      </ListItem>
    )}
    <ListSubheader disableSticky>Properties</ListSubheader>
    <SettingForm
      value={device}
      contextActions={
        device.id
          ? [
              {
                label: 'Delete',
                icon: 'delete_forever',
                onClick: deleteDevice,
                placement: 'menu',
              },
            ]
          : undefined
      }
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
          ? Object.entries(device.deviceClass.config!)
              .filter(([, config]) => config.showInSettings !== false)
              .map(([id, config]) => ({
                path: ['config', id],
                component: PropertyView,
                label: id,
                property: config,
                propertyId: id,
                required: !config.optional && config.modifiable,
              }))
          : []),
      ]}
      onSave={saveDevice}
      onChange={device => onChange(device)}
    />
    {methods.length > 0 &&
      [<ListSubheader key={2}>Actions</ListSubheader>].concat(
        methods.map(method => (
          <ProgressButton
            key={`${method.interfaceId}:${method.id}`}
            onClick={() =>
              callDevice({
                deviceId: device.id,
                interfaceId: method.interfaceId,
                method: method.id,
                arguments: {},
              })
            }
          >
            {method.name || method.id}
          </ProgressButton>
        )),
      )}
    {data &&
      data.device &&
      data.device.status &&
      data.device.status.length > 0 && [
        <ListSubheader key={2}>Status</ListSubheader>,
        data.device.status.map(status => (
          <StatusView
            key={status.id}
            id={status.id}
            label={status.statusId}
            deviceId={device.id}
            interfaceId={status.interfaceId}
            statusId={status.statusId}
            value={status.value}
          />
        )),
      ]}
  </List>
)

export const DeviceDetailSettings = enhance(
  DeviceDetailSettingsView,
) as React.ComponentClass<DeviceDetailSettingsProps>
