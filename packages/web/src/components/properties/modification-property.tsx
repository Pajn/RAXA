import {
  GraphQlDevice,
  Interface,
  Modification,
  ModificationProperty,
  Property,
} from 'raxa-common/lib/entities'
import React from 'react'
import {QueryProps} from 'react-apollo'
import {gql, graphql} from 'react-apollo'
import compose from 'recompose/compose'
import mapProps from 'recompose/mapProps'
import {SettingDropdown} from '../ui/setting-input'
import {PropertyProps} from './property'
import {StatelessStatusView} from './status'

export type ModificationInputProps = PropertyProps<
  ModificationProperty,
  Modification
>
export type GraphQlResult = {devices: Array<GraphQlDevice>}
export type PrivateModificationInputProps = ModificationInputProps & {
  data: GraphQlResult & QueryProps
  selectedDevice?: GraphQlDevice
  selectedInterface?: Interface
  selectedStatus?: Property
  interfaces?: Array<Interface>
  statuses?: Array<Property>
}

const validInterface = (iface: Interface) =>
  !!iface.status &&
  Object.values(iface.status).some(status => !!status.modifiable)

const setInterface = (interfaceId: string, selectedDevice: GraphQlDevice) => {
  const selectedInterface = selectedDevice.interfaces.find(
    iface => iface.id === interfaceId,
  )!
  return {
    interfaceId,
    statusId: Object.values(selectedInterface.status).length === 1
      ? Object.values(selectedInterface.status)[0].id
      : undefined,
  }
}

const setDevice = (deviceId: string, devices: Array<GraphQlDevice>) => {
  const selectedDevice = devices.find(device => device.id === deviceId)!
  const interfaces = selectedDevice.interfaces.filter(validInterface)
  return {
    deviceId,
    ...interfaces.length > 0
      ? setInterface(interfaces[0].id, selectedDevice)
      : undefined,
  }
}

export const enhanceModificationInput = compose(
  mapProps(props => ({
    ...props,
    interfaceIds: props.property.interfaceIds,
    deviceClassIds: props.property.deviceClassIds,
  })),
  graphql<GraphQlResult, PrivateModificationInputProps>(
    gql`
    query($interfaceIds: [String!], $deviceClassIds: [String!]) {
      devices(interfaceIds: $interfaceIds, deviceClassIds: $deviceClassIds) {
        id
        name
        interfaces {
          id
          name
          status
        }
      }
    }
  `,
  ),
  mapProps(
    (props: PrivateModificationInputProps): PrivateModificationInputProps => {
      const {data, value} = props
      const selectedDevice =
        data &&
        data.devices &&
        value &&
        data.devices.find(device => device.id === value.deviceId)
      const selectedInterface =
        selectedDevice &&
        selectedDevice.interfaces.find(iface => iface.id === value.interfaceId)
      const selectedStatus =
        selectedInterface &&
        selectedInterface.status &&
        Object.values(selectedInterface.status).find(
          status => status.id === value.statusId,
        )
      return {
        ...props,
        selectedDevice,
        selectedInterface,
        selectedStatus,
        interfaces:
          selectedDevice && selectedDevice.interfaces.filter(validInterface),
        statuses: selectedInterface && Object.values(selectedInterface.status),
      }
    },
  ),
)

export const ModificationInputView = ({
  data,
  value,
  onChange,
  selectedDevice,
  selectedInterface,
  selectedStatus,
  interfaces,
  statuses,
}: PrivateModificationInputProps) =>
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
        onChange({...value, ...setDevice(deviceId, data.devices)})}
    />
    {selectedDevice &&
      interfaces &&
      interfaces.length > 1 &&
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
      />}
    {statuses &&
      statuses.length > 1 &&
      <SettingDropdown
        label="Status"
        source={statuses.map(status => ({
          value: status.id,
          label: status.name || status.id,
        }))}
        value={value.statusId}
        onChange={statusId => onChange({...value, statusId})}
      />}
    {selectedInterface &&
      selectedStatus &&
      <StatelessStatusView
        {...value}
        id=""
        data={{interface: selectedInterface}}
        setDeviceStatus={(_, modification) =>
          Promise.resolve(onChange(modification))}
      />}
  </div>

export const ModificationInput = enhanceModificationInput(
  ModificationInputView,
) as React.ComponentClass<ModificationInputProps>
