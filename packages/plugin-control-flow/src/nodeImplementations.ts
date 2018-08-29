import {implementations as logicNodes} from '@pajn/control-flow/cjs/nodes/logic'
import {implementations as mathNodes} from '@pajn/control-flow/cjs/nodes/math'
import {implementations as utilityNodes} from '@pajn/control-flow/cjs/nodes/utilities'
import {
  NodeController,
  NodeTypeImplementation,
} from '@pajn/control-flow/cjs/schematic-core/entities'
import {ApolloClient, gql} from 'apollo-boost'
import {Call, Modification} from 'raxa-common'
import ControlFlowPlugin from '.'

const checkNodeImplementations = <
  T extends Record<string, NodeTypeImplementation>
>(
  nodeImplementations: T,
) => nodeImplementations

export const getNodeImplementations = (raxaClient: ApolloClient<any>) => {
  const variables = new Map<string, any>()
  const httpListeners = new Map<string, (value: string) => void>()

  function httpReceive(name: string, value: string) {
    if (httpListeners.has(name)) {
      httpListeners.get(name)!(value)
      return true
    } else {
      return false
    }
  }

  const callDevice = (call: Call) =>
    raxaClient.mutate({
      mutation: gql`
        mutation(
          $deviceId: String!
          $interfaceId: String!
          $method: String!
          $arguments: JSON!
        ) {
          callDevice(
            deviceId: $deviceId
            interfaceId: $interfaceId
            method: $method
            arguments: $arguments
          ) {
            id
          }
        }
      `,
      variables: call,
    })

  const setDeviceStatus = (modification: Modification) =>
    raxaClient.mutate({
      mutation: gql`
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
          }
        }
      `,
      variables: modification,
    })

  const raxaNodeImplementations = (plugin: ControlFlowPlugin) =>
    checkNodeImplementations({
      deviceStatusChanged: {
        id: 'deviceStatusChanged',
        onStart(ctrl: NodeController) {
          ctrl.state = {
            status: {},
            listener: (modification: Modification) => {
              if (
                modification.deviceId === ctrl.getProperty('device') &&
                modification.interfaceId === ctrl.getProperty('interface')
              ) {
                ctrl.state.status[`status_${modification.statusId}`] =
                  modification.value
                ctrl.dispatchEvent('event')
              }
            },
          }
          plugin.deviceStatusListeners.add(ctrl.state.listener)
        },
        onStop(ctrl: NodeController) {
          plugin.deviceStatusListeners.delete(ctrl.state.listener)
        },
        getPort(portId: string, ctrl: NodeController) {
          return ctrl.state.status[portId]
        },
      },
      setDeviceStatus: {
        id: 'setDeviceStatus',
        onEvent(_, ctrl: NodeController) {
          setDeviceStatus({
            deviceId: ctrl.getProperty('device'),
            interfaceId: ctrl.getProperty('interface'),
            statusId: ctrl.getProperty('status'),
            value: ctrl.getPort('value'),
          })
        },
      },
      callDevice: {
        id: 'callDevice',
        onEvent(_, ctrl: NodeController) {
          callDevice({
            deviceId: ctrl.getProperty('device'),
            interfaceId: ctrl.getProperty('interface'),
            method: ctrl.getProperty('method'),
            arguments: {},
          })
        },
      },
      getVariable: {
        id: 'getVariable',
        getPort(_, ctrl) {
          return variables.get(ctrl.getProperty('name'))
        },
      },
      setVariable: {
        id: 'setVariable',
        onEvent(_, ctrl) {
          console.log('================================================')
          console.log('================================================')
          console.log('================================================')
          console.log('VARIABLE SET:', ctrl.getPort('value'))
          console.log('================================================')
          console.log('================================================')
          console.log('================================================')
          return variables.set(ctrl.getProperty('name'), ctrl.getPort('value'))
        },
      },
      httpRequest: {
        id: 'httpRequest',
        onStart(ctrl: NodeController) {
          ctrl.state = {
            value: undefined,
            listener: (value: string) => {
              console.log('http fire', value)
              ctrl.state.value = value
              ctrl.dispatchEvent('event')
            },
          }
          httpListeners.set(ctrl.getProperty('name'), ctrl.state.listener)
        },
        onStop(ctrl: NodeController) {
          httpListeners.delete(ctrl.getProperty('name'))
        },
        onPropertiesChanged(ctrl: NodeController, oldProperties) {
          if (ctrl.getProperty('name') !== oldProperties.name) {
            httpListeners.delete(oldProperties.name)
            httpListeners.set(ctrl.getProperty('name'), ctrl.state.listener)
          }
        },
        getPort(_, ctrl) {
          return ctrl.state.value
        },
      },
    })

  const nodeImplementations = (
    plugin: ControlFlowPlugin,
  ): {[n: string]: NodeTypeImplementation} => ({
    ...raxaNodeImplementations(plugin),
    ...logicNodes,
    ...mathNodes,
    ...utilityNodes,
  })

  return {nodeImplementations, httpReceive}
}
