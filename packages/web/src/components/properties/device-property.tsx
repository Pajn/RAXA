import {Device, DeviceProperty} from 'raxa-common'
import React from 'react'
import {QueryProps} from 'react-apollo'
import {gql, graphql} from 'react-apollo/lib'
import compose from 'recompose/compose'
import mapProps from 'recompose/mapProps'
import {SettingDropdown} from '../ui/setting-input'
import {GenericDisplay, PropertyProps} from './property'

export type DeviceDispayProps = PropertyProps<DeviceProperty>
export type PrivateDeviceDispayProps = DeviceDispayProps & {
  data: {device: Device} & QueryProps
}

export const enhanceDeviceDisplay = compose(
  graphql(gql`
    query($value: String!) {
      device(id: $value) {
        id
        name
      }
    }
  `, {skip: ({value}) => !value})
)

export const DeviceDispayView = ({data, property}: PrivateDeviceDispayProps) =>
  <GenericDisplay
    property={property}
    value={data && data.device && data.device.name}
  />

export const DeviceDispay = enhanceDeviceDisplay(DeviceDispayView) as React.ComponentClass<DeviceDispayProps>

export type DeviceInputProps = PropertyProps<DeviceProperty>
export type PrivateDeviceInputProps = DeviceInputProps & {
  data: {devices: Array<Device>} & QueryProps
}

export const enhanceDeviceInput = compose(
  mapProps(props => ({
    ...props,
    interfaceIds: props.property.interfaceIds,
    deviceClassIds: props.property.deviceClassIds,
  })),
  graphql(gql`
    query($interfaceIds: [String!], $deviceClassIds: [String!]) {
      devices(interfaceIds: $interfaceIds, deviceClassIds: $deviceClassIds) {
        id
        name
      }
    }
  `)
)

export const DeviceInputView = ({data, property, value, onChange}: PrivateDeviceInputProps) =>
  <SettingDropdown
    label={property.name || property.id}
    source={(data && data.devices) ? data.devices.map(device => ({value: device.id, label: device.name})) : []}
    value={value}
    onChange={onChange}
  />

export const DeviceInput = enhanceDeviceInput(DeviceInputView) as React.ComponentClass<DeviceInputProps>
