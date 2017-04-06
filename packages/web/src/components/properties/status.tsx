import {Interface, Modification} from 'raxa-common'
import * as React from 'react'
import {InjectedGraphQLProps, gql, graphql} from 'react-apollo/lib'
import {connect} from 'react-redux'
import compose from 'recompose/compose'
import {action} from 'redux-decorated'
import {actions} from '../../redux-snackbar/actions'
import {PropertyView} from './property'

export type StatusProps = {
  id: string
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
  connect(),
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
        value
      }
    }
  `, {
    props: ({mutate, ownProps: {id, dispatch}}) => ({
      setDeviceStatus(modification: Modification) {
        return mutate({
          variables: modification,
          optimisticResponse: {
            __typename: 'Mutation',
            setDeviceStatus: {
              __typename: 'DeviceStatus',
              id,
              value: modification.value,
            },
          },
        })
          .catch(() => {
            dispatch(action(actions.showSnackbar, {
              label: 'Failed to update device status',
              type: 'warning' as 'warning',
            }))
          })
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
