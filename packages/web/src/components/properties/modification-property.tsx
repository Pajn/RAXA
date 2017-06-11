import {
  GraphQlDevice,
  Interface,
  Modification,
  ModificationProperty,
  Property,
} from 'raxa-common/lib/entities'
import React from 'react'
import {QueryProps} from 'react-apollo'
import {gql, graphql} from 'react-apollo/lib'
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
      }
    },
  ),
)

export const ModificationInputView = ({
  data,
  property,
  value,
  onChange,
  selectedDevice,
  selectedInterface,
  selectedStatus,
}: PrivateModificationInputProps) =>
  <div>
    <SettingDropdown
      label={property.name || property.id}
      source={
        data && data.devices
          ? data.devices.map(device => ({value: device.id, label: device.name}))
          : []
      }
      value={value && value.deviceId}
      onChange={deviceId => onChange({...value, deviceId})}
    />
    {selectedDevice &&
      <SettingDropdown
        label={property.name || property.id}
        source={selectedDevice.interfaces
          .filter(iface => iface.status)
          .map(iface => ({
            value: iface.id,
            label: iface.name,
          }))}
        value={value.interfaceId}
        onChange={interfaceId => {
          onChange({...value, interfaceId})
        }}
      />}
    {selectedInterface &&
      <SettingDropdown
        label={property.name || property.id}
        source={Object.values(selectedInterface.status).map(status => ({
          value: status.id,
          label: status.name,
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
