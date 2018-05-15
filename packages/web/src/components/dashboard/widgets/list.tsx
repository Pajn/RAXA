import glamorous from 'glamorous'
import gql from 'graphql-tag'
import {shadow} from 'material-definitions'
import {ListSubheader} from 'material-ui/List'
import {DeviceType, GraphQlDevice, defaultInterfaces} from 'raxa-common'
import React, {
  ReactElement,
  ReactNode,
  cloneElement,
  createContext,
} from 'react'
import {graphql} from 'react-apollo'
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
import {CurrentlyPlayingWidget} from './currently-playing'
import {DisplayWidget} from './display'
import {LightWidget} from './light'
import {ReceiverWidget} from './receiver'

export const draggingContext = createContext({isDragging: false})

class Hideable extends React.Component<
  {
    children: (
      hideComponent: (isHidden: boolean) => null,
      isHidden: boolean,
    ) => ReactNode
  },
  {}
> {
  state = {isHidden: false}

  hideComponent = isHidden => {
    if (this.state.isHidden !== isHidden) {
      this.setState({isHidden})
    }
    return null
  }

  render() {
    return this.props.children(this.hideComponent, this.state.isHidden)
  }
}

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

const DeviceWrapperContainer = glamorous.div<{
  row: boolean
  big?: boolean
  border: boolean
  theme: any
}>(({row, big = false, border, theme}) => ({
  position: 'relative',
  boxSizing: 'border-box',
  margin: row ? 8 : 0,
  padding: row ? 16 : 8,
  height: row ? 48 : big ? 96 : 56,
  overflow: 'hidden',

  backgroundColor: theme.dark ? theme.background.light : theme.background.main,
  boxShadow: row ? shadow[1].boxShadow : 'none',

  borderTop: !border || row ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
}))

const DeviceWrapper = ({
  children,
  style,
  ...props
}: {
  row: boolean
  big?: boolean
  border: boolean
  children: ReactNode
  innerRef(element?: HTMLElement | null): any
} & Partial<DraggableProvidedDraggableProps> &
  Partial<DraggableProvidedDragHandleProps>) => (
  <DeviceWrapperContainer
    {...props}
    style={{
      ...(style as any),
    }}
  >
    {children}
  </DeviceWrapperContainer>
)

export type ListWidgetConfiguration = {
  types?: Array<DeviceType>
  interfaceIds?: Array<string>
}
export type ListWidgetProps = WidgetProps<ListWidgetConfiguration> & {
  row?: true
  column?: true
  big?: true
  sortOrder?: Array<string>
  setSortOrder?: (sortOrder: Array<string>) => void
  header?: string
}
export type ListWidgetPrivateProps = ListWidgetProps & {
  row: boolean
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
    `,
    {
      options: (props: ListWidgetProps) => ({
        fetchPolicy: 'cache-and-network',
        variables: {
          types: props.config.types,
          interfaceIds: props.config.interfaceIds,
        },
      }),
    },
  ),
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
  big,
  config: {interfaceIds},
  onSortEnd,
  canSort,
  enableSort,
  disableSort,
  disabledSort,
}: ListWidgetPrivateProps) =>
  data.devices && data.devices.length > 0 ? (
    <>
      <DragDropContext onDragEnd={onSortEnd}>
        {header && (
          <ListSubheader color="default" style={{zIndex: 2}}>
            {header}
          </ListSubheader>
        )}
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
                          : device.interfaceIds!.includes('CurrentlyPlaying') &&
                            (!interfaceIds ||
                              interfaceIds.includes('CurrentlyPlaying'))
                            ? [
                                false,
                                <CurrentlyPlayingWidget
                                  key={device.id}
                                  config={{
                                    deviceId: device.id,
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
                    <Hideable key={innerWidget.key!}>
                      {(hideComponent, isHidden) =>
                        isHidden ? (
                          cloneElement(innerWidget, {
                            hideComponent,
                          })
                        ) : (
                          <Draggable
                            draggableId={innerWidget.key! as string}
                            index={i}
                            isDragDisabled={
                              !canSort ||
                              disabledSort.includes(data.devices![i].id)
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
                                    big={big}
                                    border={i > 0}
                                    innerRef={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={provided.draggableProps.style as any}
                                  >
                                    {cloneElement(innerWidget, {hideComponent})}
                                  </DeviceWrapper>
                                </div>
                              </draggingContext.Provider>
                            )}
                          </Draggable>
                        )
                      }
                    </Hideable>
                  ),
                )}
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
