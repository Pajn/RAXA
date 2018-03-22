import {Call, Modification, Property} from 'raxa-common'
import {
  Action,
  ActionProperty,
  GraphQlDevice,
  Interface,
  Method,
} from 'raxa-common/lib/entities'
import React from 'react'
import {QueryProps} from 'react-apollo'
import {gql, graphql} from 'react-apollo'
import {compose, mapProps} from 'recompose'
import {SettingDropdown} from '../ui/setting-input'
import {PropertyProps, PropertyView} from './property'
import {StatelessStatusView} from './status'

export type ActionInputProps = PropertyProps<ActionProperty, Action>
export type GraphQlResult = {devices: Array<GraphQlDevice>}
export type PrivateActionInputProps = ActionInputProps & {
  data: GraphQlResult & QueryProps
  selectedDevice?: GraphQlDevice
  selectedInterface?: Interface
  selectedMethod?: Method
  selectedStatus?: Property
  interfaces?: Array<Interface>
  actions: Array<Method | Property>
}

const validInterface = (iface: Interface) =>
  (iface.methods && Object.keys(iface.methods).length >= 1) ||
  (!!iface.status &&
    Object.values(iface.status).some(status => !!status.modifiable))

const setInterface = (interfaceId: string, selectedDevice: GraphQlDevice) => {
  const selectedInterface = selectedDevice.interfaces.find(
    iface => iface.id === interfaceId,
  )!
  const method =
    selectedInterface.methods &&
    Object.values(selectedInterface.methods).length === 1
      ? Object.values(selectedInterface.methods)[0].id
      : undefined
  const statusId =
    selectedInterface.status &&
    Object.values(selectedInterface.status).length === 1
      ? Object.values(selectedInterface.status)[0].id
      : undefined

  let value =
    statusId && !method
      ? Object.values(selectedInterface.status!)[0].defaultValue
      : undefined

  return {
    interfaceId,
    method: method && statusId ? undefined : method,
    statusId: method && statusId ? undefined : statusId,
    type:
      !method && statusId
        ? 'modification'
        : method && !statusId ? 'call' : undefined,
    arguments: method && !statusId ? {} : undefined,
    value,
  }
}

const setDevice = (deviceId: string, devices: Array<GraphQlDevice>) => {
  const selectedDevice = devices.find(device => device.id === deviceId)!
  const interfaces = selectedDevice.interfaces.filter(validInterface)
  return {
    deviceId,
    ...(interfaces.length === 1
      ? setInterface(interfaces[0].id, selectedDevice)
      : {interfaceId: undefined}),
  }
}

export const enhanceActionInput = compose<
  PrivateActionInputProps,
  ActionInputProps
>(
  mapProps((props: PrivateActionInputProps) => ({
    ...props,
    interfaceIds: props.property.interfaceIds,
    deviceClassIds: props.property.deviceClassIds,
  })),
  graphql<GraphQlResult, PrivateActionInputProps>(
    gql`
      query($interfaceIds: [String!], $deviceClassIds: [String!]) {
        devices(interfaceIds: $interfaceIds, deviceClassIds: $deviceClassIds) {
          id
          name
          interfaces {
            id
            name
            methods
            status
          }
        }
      }
    `,
  ),
  mapProps((props: PrivateActionInputProps): PrivateActionInputProps => {
    const {data, value} = props
    const selectedDevice =
      data &&
      data.devices &&
      value &&
      data.devices.find(device => device.id === value.deviceId)
    const interfaces =
      selectedDevice && selectedDevice.interfaces.filter(validInterface)
    const selectedInterface =
      interfaces && interfaces.find(iface => iface.id === value.interfaceId)
    const selectedMethod =
      selectedInterface && selectedInterface.methods && value.type === 'call'
        ? Object.values(selectedInterface.methods).find(
            method => method.id === value.method,
          )
        : undefined
    const selectedStatus =
      selectedInterface &&
      selectedInterface.status &&
      value.type === 'modification'
        ? Object.values(selectedInterface.status).find(
            status => status.id === value.statusId,
          )
        : undefined
    let actions: Array<Method | Property> = []
    if (selectedInterface) {
      if (selectedInterface.methods) {
        actions = actions.concat(
          Object.values(selectedInterface.methods).map(a => ({
            ...a,
            id: `m${a.id}`,
          })),
        )
      }
      if (selectedInterface.status) {
        actions = actions.concat(
          Object.values(selectedInterface.status).map(a => ({
            ...a,
            id: `s${a.id}`,
          })),
        )
      }
    }
    return {
      ...props,
      selectedDevice,
      selectedInterface,
      selectedMethod,
      selectedStatus,
      interfaces,
      actions,
    }
  }),
)

export const ActionInputView = ({
  data,
  value,
  onChange,
  selectedDevice,
  selectedInterface,
  selectedMethod,
  selectedStatus,
  interfaces,
  actions,
}: PrivateActionInputProps) => (
  <div>
    <SettingDropdown
      label="Device"
      source={
        data && data.devices
          ? data.devices
              .filter(device => device.interfaces.some(validInterface))
              .map(device => ({value: device.id, label: device.name}))
          : []
      }
      value={value && value.deviceId}
      onChange={deviceId =>
        onChange({...value, ...setDevice(deviceId, data.devices)})
      }
    />
    {selectedDevice &&
      interfaces &&
      interfaces.length > 1 && (
        <SettingDropdown
          label="Interface"
          source={interfaces.map(iface => ({
            value: iface.id,
            label: iface.name || iface.id,
          }))}
          value={value.interfaceId}
          onChange={interfaceId => {
            onChange({
              ...value,
              ...setInterface(interfaceId, selectedDevice),
            })
          }}
        />
      )}
    {actions.length > 1 && (
      <SettingDropdown
        label="Action"
        source={actions.map(status => ({
          value: status.id,
          label: status.name || status.id,
        }))}
        value={
          value.type === 'call' ? `m${value.method}` : `s${value.statusId}`
        }
        onChange={actionId => {
          if (actionId.startsWith('m')) {
            onChange({
              ...value,
              method: actionId.slice(1),
              type: 'call',
              arguments: {},
              value: undefined,
            })
          } else {
            onChange({
              ...value,
              statusId: actionId.slice(1),
              type: 'modification',
              value: (actions.find(
                status => status.id === actionId.slice(1),
              )! as Property).defaultValue,
              arguments: undefined,
            })
          }
        }}
      />
    )}
    {selectedInterface &&
      selectedMethod &&
      Object.values(selectedMethod.arguments).map(argument => (
        <PropertyView
          key={argument.id}
          propertyId={argument.id}
          property={argument}
          value={
            (value as Call).arguments && (value as Call).arguments[argument.id]
          }
          label={argument.name || argument.id}
          onChange={argValue => {
            onChange({
              ...value,
              arguments: {
                ...(value as Call).arguments,
                [argument.id]: argValue,
              },
            })
          }}
        />
      ))}
    {selectedInterface &&
      selectedStatus && (
        <StatelessStatusView
          {...value as Modification}
          id=""
          data={{interface: selectedInterface}}
          setDeviceStatus={(_, modification) =>
            Promise.resolve(onChange({...modification, type: 'modification'}))
          }
        />
      )}
  </div>
)

export const ActionInput = enhanceActionInput(ActionInputView)
