import {Interface, Modification} from 'raxa-common'
import * as React from 'react'
import {InjectedGraphQLProps, gql, graphql} from 'react-apollo/lib'
import compose from 'recompose/compose'
import {PropertyView} from './property'

export type StatusProps = {
  deviceId: string
  interfaceId: string
  statusId: string
  value: any
  label?: string
}
export type StatusGraphqlData = {
  interface?: Interface
}
export type PrivateStatusProps = StatusProps & InjectedGraphQLProps<StatusGraphqlData> & {
  setDeviceStatus(modification: Modification): Promise<any>
}

export const enhance = compose(
  graphql(gql`
    query($interfaceId: String!) {
      interface(id: $interfaceId) {
        id
        status
      }
    }
  `),
  graphql(gql`
    mutation($deviceId: String!, $interfaceId: String!, $statusId: String!, $value: String!) {
      setDeviceStatus(deviceId: $deviceId, interfaceId: $interfaceId, statusId: $statusId, value: $value) {
        id
      }
    }
  `, {
    props: ({mutate}) => ({
      setDeviceStatus(modification: Modification) {
        return mutate({variables: modification})
      }
    })
  }),
)

export const StatelessStatusView = ({data, deviceId, interfaceId, statusId, value, label, setDeviceStatus}: PrivateStatusProps) =>
  <div>
    {data && data.interface && data.interface.status && data.interface.status[statusId] &&
      <PropertyView
        property={data.interface.status[statusId]}
        value={value}
        label={label}
        onChange={value => {
          setDeviceStatus({
            deviceId,
            interfaceId,
            statusId,
            value,
          })
        }}
      />
    }
  </div>

export const StatusView: React.ComponentClass<StatusProps> = enhance(StatelessStatusView) as any
