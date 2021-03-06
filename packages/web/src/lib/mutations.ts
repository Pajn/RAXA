import gql from 'graphql-tag'
import {Call, Modification} from 'raxa-common/lib/entities'
import {graphql} from 'react-apollo/graphql'
import {Dispatch, connect} from 'react-redux'
import {compose} from 'recompose'
import {action} from 'redux-decorated'
import {actions} from '../redux-snackbar'

type InjectedDispatch = {
  __injectedDispatch: Dispatch
}

export type UpdateDeviceStatusInjectedProps = {
  setDeviceStatus(
    deviceStatusId: string | undefined,
    modification: Modification,
  ): Promise<any>
}

export const updateDeviceStatus = () =>
  compose(
    connect(
      undefined,
      (dispatch): InjectedDispatch => ({
        __injectedDispatch: dispatch,
      }),
    ),
    graphql<
      UpdateDeviceStatusInjectedProps & InjectedDispatch,
      {},
      {deviceId: string; interfaceId: string; statusId: string; value: any},
      UpdateDeviceStatusInjectedProps
    >(
      gql`
        mutation(
          $deviceId: String!
          $interfaceId: String!
          $statusId: String!
          $value: JSON!
        ) {
          setDeviceStatus(
            deviceId: $deviceId
            interfaceId: $interfaceId
            statusId: $statusId
            value: $value
          ) {
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
          setDeviceStatus(
            deviceStatusId: string | undefined,
            modification: Modification,
          ) {
            return mutate!({
              variables: modification,
              ...(deviceStatusId
                ? {
                    optimisticResponse: {
                      __typename: 'Mutation',
                      setDeviceStatus: {
                        __typename: 'DeviceStatus',
                        id: deviceStatusId,
                        value: modification.value,
                      },
                    },
                  }
                : undefined),
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
    connect(
      undefined,
      (dispatch): InjectedDispatch => ({
        __injectedDispatch: dispatch,
      }),
    ),
    graphql<
      CallDeviceInjectedProps & InjectedDispatch,
      {},
      {deviceId: string; interfaceId: string; method: string},
      Partial<CallDeviceInjectedProps>
    >(
      gql`
        mutation($deviceId: String!, $interfaceId: String!, $method: String!) {
          callDevice(
            deviceId: $deviceId
            interfaceId: $interfaceId
            method: $method
          ) {
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
