import gql from 'graphql-tag'
import {Device} from 'raxa-common/lib/entities'
import React from 'react'
import {graphql} from 'react-apollo/graphql'
import {compose} from 'recompose'

export type DeviceNameProps = {id: string}
export type DeviceNamePrivateProps = DeviceNameProps & {
  data: {device?: Device}
}

export const enhance = compose<DeviceNamePrivateProps, DeviceNameProps>(
  graphql(gql`
    query getDevice($id: String!) {
      device(id: $id) {
        id
        name
      }
    }
  `),
)

export const DeviceNameView = ({data}: DeviceNamePrivateProps) => (
  <span>{data.device && data.device.name}</span>
)

export const DeviceName = enhance(DeviceNameView)
