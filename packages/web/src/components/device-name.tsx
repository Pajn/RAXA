import {Device} from 'raxa-common'
import React from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'recompose'

export type DeviceNameProps = {id: string}
export type DeviceNamePrivateProps = DeviceNameProps & {
  data: {device?: Device}
}

export const enhance = compose<DeviceNamePrivateProps, DeviceNameProps>(
  graphql(gql`
    query getDevice($id: String!){
      device(id: $id) {
        id
        name
      }
    }
  `),
)

export const DeviceNameView = ({data}: DeviceNamePrivateProps) =>
  <span>{data.device && data.device.name}</span>

export const DeviceName = enhance(DeviceNameView)
