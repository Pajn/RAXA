import glamorous from 'glamorous'
import {shadow} from 'material-definitions'
import {ListSubheader} from 'material-ui/List'
import {DeviceType, GraphQlDevice, defaultInterfaces} from 'raxa-common'
import React, {ReactElement, ReactNode, createContext} from 'react'
import {gql, graphql} from 'react-apollo'
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
  Droppable,
} from 'react-beautiful-dnd'
import {compose, mapProps, withHandlers, withStateHandlers} from 'recompose'
import {withInnerState} from '../../../with-lazy-reducer'
import {WidgetComponent, WidgetProps} from '../widget'
import {ButtonWidget} from './button'
import {DisplayWidget} from './display'
import {LightWidget} from './light'
import {ReceiverWidget} from './receiver'

declare module 'react' {
  type Provider<T> = React.ComponentType<{
    value: T
    children?: ReactNode
  }>

  type Consumer<T> = ComponentType<{
    children: (value: T) => ReactNode
    unstable_observedBits?: number
  }>

  interface Context<T> {
    Provider: Provider<T>
    Consumer: Consumer<T>
  }

  function createContext<T>(
    defaultValue: T,
    calculateChangedBits?: (prev: T, next: T) => number,
  ): Context<T>
}

export const draggingContext = createContext({isDragging: false})

function sortByOrder<K, T extends {id: K}>(
  sortOrder: Array<K>,
  dataArray: Array<T>,
) {
  const data = new Map<K, T>()
  for (const item of dataArray) {
    data.set(item.id, item)
  }

  const out: Array<T> = []

  for (const id of sortOrder) {
    if (data.has(id)) {
      out.push(data.get(id)!)
      data.delete(id)
    }
  }

  return [...out, ...data.values()]
}

function reorder<T>(list: Array<T>, startIndex: number, endIndex: number) {
  console.log('reorder', startIndex, endIndex)
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const Container = glamorous.div<{row: boolean}>(({row}) => ({
  display: 'flex',
  flexDirection: row ? 'row' : 'column',
  flexWrap: row ? 'wrap' : 'nowrap',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  marginTop: row ? -8 : 0,
  marginLeft: row ? 8 : 16,
  marginRight: row ? 8 : 16,
  marginBottom: row ? 8 : 16,

  boxShadow: row ? 'none' : shadow[1].boxShadow,
}))

const dragContainerStyles = (row: boolean) => ({
  flexGrow: row ? 1 : undefined,
  flexBasis: row ? '25%' : undefined,
  width: row ? undefined : '100%',
})

const DeviceWrapper = ({
  row,
  border,
  children,
  innerRef,
  style,
  ...props
}: {
  row: boolean
  border: boolean
  children: ReactNode
  innerRef(element?: HTMLElement | null): any
} & Partial<DraggableProvidedDraggableProps> &
  Partial<DraggableProvidedDragHandleProps>) => (
  <div
    {...props}
    ref={innerRef}
    style={{
      position: 'relative',
      boxSizing: 'border-box',
      margin: row ? 8 : 0,
      padding: row ? 16 : 8,
      height: row ? 48 : 56,
      overflow: 'hidden',

      backgroundColor: 'white',
      boxShadow: row ? shadow[1].boxShadow : 'none',

      borderTop: !border || row ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',

      ...(style as any),
    }}
  >
    {children}
  </div>
)

export type ListWidgetConfiguration = {
  types?: Array<DeviceType>
  interfaceIds?: Array<string>
}
export type ListWidgetProps = WidgetProps<ListWidgetConfiguration> & {
  row?: true
  column?: true
  sortOrder?: Array<string>
  setSortOrder?: (sortOrder: Array<string>) => void
  header?: string
}
export type ListWidgetPrivateProps = ListWidgetProps & {
  row: boolean
  interfaceIds?: Array<string>
  data: {devices?: Array<GraphQlDevice>}
  onSortEnd: (result: any) => void
  setData: (data: {devices?: Array<GraphQlDevice>}) => void
  canSort: boolean
  disabledSort: Array<string>
  enableSort: (deviceId: string) => void
  disableSort: (deviceId: string) => void
}

export const enhance = compose<ListWidgetPrivateProps, ListWidgetProps>(
  mapProps((props: ListWidgetProps) => ({
    ...props,
    types: props.config.types,
    interfaceIds: props.config.interfaceIds,
    row: props.row || !props.column,
  })),
  graphql(gql`
    query($types: [String!], $interfaceIds: [String!]) {
      devices(types: $types, interfaceIds: $interfaceIds) {
        id
        name
        types
        config
        interfaceIds
        status {
          id
          interfaceId
          statusId
          value
        }
      }
    }
  `),
  mapProps((props: ListWidgetPrivateProps) => ({
    ...props,
    data:
      props.data.devices && props.sortOrder
        ? {
            ...props.data,
            devices: sortByOrder(props.sortOrder, props.data.devices),
          }
        : props.data,
    canSort: !!props.setSortOrder,
  })),
  withInnerState('data', 'setData'),
  withStateHandlers(
    {disabledSort: [] as Array<string>},
    {
      disableSort: state => deviceId => ({
        disabledSort: [...state.disabledSort, deviceId],
      }),
      enableSort: state => deviceId => ({
        disabledSort: state.disabledSort.filter(id => id !== deviceId),
      }),
    },
  ),
  withHandlers({
    onSortEnd: ({
      data,
      setData,
      setSortOrder,
    }: ListWidgetPrivateProps) => result => {
      if (setSortOrder) {
        // dropped outside the list
        if (!result.destination) {
          return
        }

        console.log('result', result)
        console.log('pre', data.devices!.map(d => d.name))
        const sorted = reorder(
          data.devices!,
          result.source.index,
          result.destination.index,
        )
        console.log('post', sorted.map(d => d.name))
        setData({...data, devices: sorted})
        setSortOrder(sorted.map(d => d.id))
      }
    },
  }),
)

export const ListWidgetView = ({
  header,
  data,
  row,
  interfaceIds,
  onSortEnd,
  canSort,
  enableSort,
  disableSort,
  disabledSort,
}: ListWidgetPrivateProps) =>
  data.devices && data.devices.length > 0 ? (
    <>
      <DragDropContext onDragEnd={onSortEnd}>
        {header && <ListSubheader>{header}</ListSubheader>}
        <Droppable
          droppableId={`droppable-${header}`}
          direction={row ? 'horizontal' : 'vertical'}
        >
          {provided => (
            <Container
              {...provided.droppableProps}
              innerRef={provided.innerRef}
              row={row}
            >
              {data
                .devices!.map(
                  (device): null | [boolean, ReactElement<any>] =>
                    device.interfaceIds
                      ? device.types!.includes(DeviceType.Thermometer) &&
                        (!interfaceIds ||
                          interfaceIds.includes(
                            defaultInterfaces.Temperature.id,
                          ))
                        ? [
                            false,
                            <DisplayWidget
                              key={device.id}
                              config={{
                                deviceId: device.id,
                                interfaceId: defaultInterfaces.Temperature.id,
                                statusId:
                                  defaultInterfaces.Temperature.status.temp.id,
                              }}
                            />,
                          ]
                        : device.interfaceIds!.includes('Scenery') &&
                          (!interfaceIds || interfaceIds.includes('Scenery'))
                          ? [
                              true,
                              <ButtonWidget
                                key={device.id}
                                config={{
                                  deviceId: device.id,
                                  interfaceId: 'Scenery',
                                  method: 'set',
                                }}
                              />,
                            ]
                          : device.interfaceIds!.includes('SonyReceiver') &&
                            (!interfaceIds ||
                              interfaceIds.includes('SonyReceiver'))
                            ? [
                                false,
                                <ReceiverWidget
                                  key={device.id}
                                  config={{
                                    deviceId: device.id,
                                  }}
                                />,
                              ]
                            : (device.types!.includes(DeviceType.Light) ||
                                device.types!.includes(DeviceType.Outlet)) &&
                              (!interfaceIds ||
                                interfaceIds.includes(
                                  defaultInterfaces.Power.id,
                                ) ||
                                interfaceIds.includes(
                                  defaultInterfaces.Dimmer.id,
                                ))
                              ? [
                                  true,
                                  <LightWidget
                                    key={device.id}
                                    config={{deviceId: device.id}}
                                    enableSort={enableSort}
                                    disableSort={disableSort}
                                  />,
                                ]
                              : null
                      : null,
                )
                .filter(innerWidget => innerWidget != null)
                .map(
                  (
                    [disableInteractiveElementBlocking, innerWidget]: any,
                    i,
                  ) => (
                    <Draggable
                      key={innerWidget.key!}
                      draggableId={innerWidget.key! as string}
                      index={i}
                      isDragDisabled={
                        !canSort || disabledSort.includes(data.devices![i].id)
                      }
                      disableInteractiveElementBlocking={
                        disableInteractiveElementBlocking
                      }
                    >
                      {(provided, snapshot) => (
                        <draggingContext.Provider
                          value={{isDragging: snapshot.isDragging}}
                        >
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={dragContainerStyles(row)}
                          >
                            <DeviceWrapper
                              row={row}
                              border={i > 0}
                              innerRef={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style as any}
                            >
                              {innerWidget}
                            </DeviceWrapper>
                            {provided.placeholder}
                          </div>
                        </draggingContext.Provider>
                      )}
                    </Draggable>
                  ),
                )}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </>
  ) : null

export const ListWidget: WidgetComponent<
  ListWidgetConfiguration,
  ListWidgetProps
> = Object.assign(enhance(ListWidgetView), {
  type: 'ListWidget',
  uiName: 'Device List',
  defaultSize: {width: 5, height: 2},
  demoConfig: {interfaceIds: ['Scenery', 'Light', 'Dimmer']},
})
