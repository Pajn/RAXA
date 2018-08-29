import {nodeTypes as logicNodes} from '@pajn/control-flow/cjs/nodes/logic'
import {nodeTypes as mathNodes} from '@pajn/control-flow/cjs/nodes/math'
import {nodeTypes as utilityNodes} from '@pajn/control-flow/cjs/nodes/utilities'
import {
  DataType,
  NodeTypes,
  Port,
  ValuePort,
} from '@pajn/control-flow/cjs/schematic-core/entities'
import ApolloClient, {gql} from 'apollo-boost'
import {GraphQlInterface, Property, ValueType} from 'raxa-common'

const checkNodeTypes = <T extends NodeTypes>(nodeTypes: T) => nodeTypes

export const getNodeTypes = (raxaClient: ApolloClient<any>) => {
  const getDevices = () =>
    raxaClient
      .query<any>({
        query: gql`
          query {
            devices {
              id
              value: id
              name
            }
          }
        `,
      })
      .then(({data}) => data.devices)

  const getInterfaces = ({device}: {device?: string}) =>
    device
      ? raxaClient
          .query<any>({
            query: gql`
              query($device: String!) {
                device(id: $device) {
                  id
                  interfaces {
                    id
                    value: id
                    name
                  }
                }
              }
            `,
            variables: {device},
          })
          .then(({data}) => data.device.interfaces)
      : []

  const getStatuses = ({
    device,
    interface: iface,
  }: {
    device?: string
    interface?: string
  }) =>
    device && iface
      ? raxaClient
          .query<{interface: GraphQlInterface}>({
            query: gql`
              query($iface: String!) {
                interface(id: $iface) {
                  id
                  status
                }
              }
            `,
            variables: {iface},
          })
          .then(
            ({data}) =>
              data.interface.status
                ? Object.values(data.interface.status).map(status => ({
                    ...status,
                    value: status.id,
                    name: status.name || status.id,
                  }))
                : [],
          )
      : []

  const getMethods = ({
    device,
    interface: iface,
  }: {
    device?: string
    interface?: string
  }) =>
    device && iface
      ? raxaClient
          .query<any>({
            query: gql`
              query($iface: String!) {
                interface(id: $iface) {
                  id
                  methods
                }
              }
            `,
            variables: {iface},
          })
          .then(({data}) =>
            Object.values(data.interface.methods).map((methods: any) => ({
              id: methods.id,
              value: methods.id,
              name: methods.name || methods.id,
            })),
          )
      : []

  const getStatus = ({
    device,
    interface: iface,
    status,
  }: {
    device?: string
    interface?: string
    status?: string
  }) =>
    device && iface && status
      ? raxaClient
          .query<{interface: GraphQlInterface}>({
            query: gql`
              query($iface: String!) {
                interface(id: $iface) {
                  id
                  status
                }
              }
            `,
            variables: {iface},
          })
          .then(
            ({data}) => data.interface.status && data.interface.status[status],
          )
      : undefined

  const getMethod = ({
    device,
    interface: iface,
    method,
  }: {
    device?: string
    interface?: string
    method?: string
  }) =>
    device && iface && method
      ? raxaClient
          .query<{interface: GraphQlInterface}>({
            query: gql`
              query($iface: String!) {
                interface(id: $iface) {
                  id
                  methods
                }
              }
            `,
            variables: {iface},
          })
          .then(
            ({data}) =>
              data.interface.methods && data.interface.methods[method],
          )
      : undefined

  const dataTypesRaxaToControlFlow: Partial<Record<ValueType, DataType>> = {
    string: 'String',
    number: 'Num',
    integer: 'Num',
    boolean: 'Bool',
    enum: 'Enum',
    object: 'Object',
  }

  const propertyToValuePort = (
    id: string,
    property: Property,
    kind?: 'ValueInput' | 'ValueOutput',
  ): Port & ValuePort => {
    let properties: Record<string, ValuePort> | undefined = undefined
    if (property.type === 'object') {
      properties = {}
      for (const [id, prop] of Object.entries(property.properties)) {
        properties[id] = propertyToValuePort(id, prop)
      }
    }

    return {
      id,
      kind: kind as any,
      dataType: dataTypesRaxaToControlFlow[property.type]!,
      name: property.name,
      values: property.type === 'enum' ? property.values : undefined,
      properties,
    }
  }

  const raxaNodes = checkNodeTypes({
    deviceStatusChanged: {
      id: 'deviceStatusChanged',
      name: 'Device status changed',
      ports: {
        event: {id: 'event', kind: 'EventOutput'},
      },
      properties: {
        device: {
          id: 'device',
          name: 'Device',
          dataType: 'Enum',
          required: true,
          getValues: getDevices,
        },
        interface: {
          id: 'interface',
          name: 'Interface',
          dataType: 'Enum',
          required: true,
          getValues: getInterfaces,
        },
      },
      async dynamicOverrides(properties: Record<string, string>) {
        console.log('dynamicOverrides', properties)
        const statuses = await getStatuses(properties)
        const ports: Record<string, Port> = {
          event: {id: 'event', kind: 'EventOutput'},
        }
        for (const status of statuses) {
          if (dataTypesRaxaToControlFlow[status.type]) {
            const id = `status_${status.id}`
            ports[id] = propertyToValuePort(id, status, 'ValueOutput')
          }
        }
        console.log('ports', ports)
        return {ports}
      },
    },
    setDeviceStatus: {
      id: 'setDeviceStatus',
      name: 'Set device status',
      ports: {
        event: {id: 'event', kind: 'EventInput'},
      },
      properties: {
        device: {
          id: 'device',
          name: 'Device',
          dataType: 'Enum',
          required: true,
          getValues: getDevices,
        },
        interface: {
          id: 'interface',
          name: 'Interface',
          dataType: 'Enum',
          required: true,
          getValues: getInterfaces,
        },
        status: {
          id: 'status',
          name: 'Status',
          dataType: 'Enum',
          required: true,
          getValues: getStatuses,
        },
      },
      async dynamicOverrides(properties: Record<string, string>) {
        const status = await getStatus(properties)
        const ports: Record<string, Port> = {
          event: {id: 'event', kind: 'EventInput'},
        }
        if (status && dataTypesRaxaToControlFlow[status.type]) {
          const id = `value`
          ports[id] = propertyToValuePort(id, status, 'ValueInput')
        }
        console.log('ports', ports)
        return {ports}
      },
    },
    callDevice: {
      id: 'callDevice',
      name: 'Call device',
      ports: {
        event: {id: 'event', kind: 'EventInput'},
      },
      properties: {
        device: {
          id: 'device',
          name: 'Device',
          dataType: 'Enum',
          required: true,
          getValues: getDevices,
        },
        interface: {
          id: 'interface',
          name: 'Interface',
          dataType: 'Enum',
          required: true,
          getValues: getInterfaces,
        },
        method: {
          id: 'method',
          name: 'Method',
          dataType: 'Enum',
          required: true,
          getValues: getMethods,
        },
      },
      async dynamicOverrides(properties: Record<string, string>) {
        const method = await getMethod(properties)
        const ports: Record<string, Port> = {
          event: {id: 'event', kind: 'EventInput'},
        }
        if (method) {
          for (const arg of Object.values(method.arguments)) {
            if (dataTypesRaxaToControlFlow[arg.type]) {
              const id = `arg_${arg.id}`
              ports[id] = propertyToValuePort(id, arg, 'ValueInput')
            }
          }
        }
        console.log('ports', ports)
        return {ports}
      },
    },
    getVariable: {
      id: 'getVariable',
      name: 'Get Variable',
      ports: {
        value: {id: 'value', kind: 'ValueOutput', dataType: 'Any'},
      },
      properties: {
        name: {
          id: 'name',
          name: 'Name',
          dataType: 'String',
          required: true,
        },
      },
    },
    setVariable: {
      id: 'setVariable',
      name: 'Set Variable',
      ports: {
        event: {id: 'event', kind: 'EventInput'},
        value: {id: 'value', kind: 'ValueInput', dataType: 'Any'},
      },
      properties: {
        name: {
          id: 'name',
          name: 'Name',
          dataType: 'String',
          required: true,
        },
      },
    },
    httpRequest: {
      id: 'httpRequest',
      name: 'Receive HTTP Request',
      ports: {
        event: {id: 'event', kind: 'EventOutput'},
        value: {id: 'value', kind: 'ValueOutput', dataType: 'String'},
      },
      properties: {
        name: {
          id: 'name',
          name: 'Name',
          dataType: 'String',
          required: true,
        },
      },
    },
  })

  const nodeTypes = checkNodeTypes({
    ...raxaNodes,
    ...logicNodes,
    ...mathNodes,
    ...utilityNodes,
  })

  return nodeTypes
}
