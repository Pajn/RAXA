import {Call, Modification} from 'raxa-common'
import {gql, graphql} from 'react-apollo'
import {Dispatch, connect} from 'react-redux'
import {compose} from 'recompose'
import {action} from 'redux-decorated'
import {actions} from '../redux-snackbar/actions'

type InjectedDispatch = {
  __injectedDispatch: Dispatch
}

export type UpdateDeviceStatusInjectedProps = {
  setDeviceStatus(
    deviceStatusId: string,
    modification: Modification,
  ): Promise<any>
}

export const updateDeviceStatus = () =>
  compose(
    connect(undefined, (dispatch): InjectedDispatch => ({
      __injectedDispatch: dispatch,
    })),
    graphql<{}, UpdateDeviceStatusInjectedProps & InjectedDispatch>(
      gql`
      mutation($deviceId: String!, $interfaceId: String!, $statusId: String!, $value: String!) {
        setDeviceStatus(deviceId: $deviceId, interfaceId: $interfaceId, statusId: $statusId, value: $value) {
          id
          value
        }
      }
    `,
      {
        props: ({
          mutate,
          ownProps: {__injectedDispatch: dispatch},
        }): UpdateDeviceStatusInjectedProps => ({
          setDeviceStatus(deviceStatusId: string, modification: Modification) {
            return mutate!({
              variables: modification,
              optimisticResponse: {
                __typename: 'Mutation',
                setDeviceStatus: {
                  __typename: 'DeviceStatus',
                  id: deviceStatusId,
                  value: modification.value,
                },
              },
            }).catch(() => {
              dispatch(
                action(actions.showSnackbar, {
                  label: 'Failed to update device status',
                  type: 'warning' as 'warning',
                }),
              )
            })
          },
        }),
      },
    ),
  )

export type CallDeviceInjectedProps = {
  callDevice(call: Call): Promise<any>
}

export const callDevice = () =>
  compose(
    connect(undefined, (dispatch): InjectedDispatch => ({
      __injectedDispatch: dispatch,
    })),
    graphql<{}, CallDeviceInjectedProps & InjectedDispatch>(
      gql`
      mutation($deviceId: String!, $interfaceId: String!, $method: String!) {
        callDevice(deviceId: $deviceId, interfaceId: $interfaceId, method: $method) {
          id
        }
      }
    `,
      {
        props: ({
          mutate,
          ownProps: {__injectedDispatch: dispatch},
        }): CallDeviceInjectedProps => ({
          callDevice(call: Call) {
            return mutate!({
              variables: call,
            }).catch(() => {
              dispatch(
                action(actions.showSnackbar, {
                  label: 'Failed to call device',
                  type: 'warning' as 'warning',
                }),
              )
            })
          },
        }),
      },
    ),
  )
