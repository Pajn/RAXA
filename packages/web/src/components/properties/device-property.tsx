import gql from 'graphql-tag'
import {Device, DeviceProperty} from 'raxa-common/lib/entities'
import React from 'react'
import {graphql} from 'react-apollo/graphql'
import {DataProps} from 'react-apollo/types'
import {compose, mapProps} from 'recompose'
import {SettingDropdown} from '../ui/setting-input'
import {GenericDisplay, PropertyProps} from './property'

export type DeviceDispayProps = PropertyProps<DeviceProperty>
export type PrivateDeviceDispayProps = DeviceDispayProps &
  DataProps<{device: Device}>

export const enhanceDeviceDisplay = compose<
  PrivateDeviceDispayProps,
  DeviceDispayProps
>(
  graphql(
    gql`
      query($value: String!) {
        device(id: $value) {
          id
          name
        }
      }
    `,
    {skip: ({value}) => !value},
  ),
)

export const DeviceDispayView = ({
  data,
  property,
}: PrivateDeviceDispayProps) => (
  <GenericDisplay
    propertyId={property.id}
    property={property}
    value={data && data.device && data.device.name}
  />
)

export const DeviceDispay = enhanceDeviceDisplay(
  DeviceDispayView,
) as React.ComponentClass<DeviceDispayProps>

export type DeviceInputProps = PropertyProps<DeviceProperty>
export type PrivateDeviceInputProps = DeviceInputProps &
  DataProps<{devices: Array<Device>}>

export const enhanceDeviceInput = compose(
  mapProps((props: DeviceDispayProps) => ({
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
  `),
)

export const DeviceInputView = ({
  data,
  property,
  value,
  onChange,
}: PrivateDeviceInputProps) => (
  <SettingDropdown
    label={property.name || property.id}
    source={
      data && data.devices
        ? data.devices.map(device => ({value: device.id, label: device.name}))
        : []
    }
    value={value}
    onChange={onChange}
  />
)

export const DeviceInput = enhanceDeviceInput(DeviceInputView)
