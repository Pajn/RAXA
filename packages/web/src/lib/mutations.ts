import {Modification} from 'raxa-common'
import {gql, graphql} from 'react-apollo/lib'
import {Dispatch, connect} from 'react-redux'
import compose from 'recompose/compose'
import {action} from 'redux-decorated'
import {actions} from '../redux-snackbar/actions'

type InjectedInspatch = {
  __updateDeviceStatusDispatch: Dispatch
}

export type UpdateDeviceStatusInjectedProps = {
  setDeviceStatus(
    deviceStatusId: string,
    modification: Modification,
  ): Promise<any>
}

export const updateDeviceStatus = () =>
  compose(
    connect(undefined, (dispatch): InjectedInspatch => ({
      __updateDeviceStatusDispatch: dispatch,
    })),
    graphql<{}, UpdateDeviceStatusInjectedProps & InjectedInspatch>(
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
          ownProps: {__updateDeviceStatusDispatch: dispatch},
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
