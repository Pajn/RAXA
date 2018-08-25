import IconButton from '@material-ui/core/IconButton'
import ListSubheader from '@material-ui/core/ListSubheader'
import DoneIcon from '@material-ui/icons/Done'
import gql from 'graphql-tag'
import loadable from 'loadable-components'
import {shadow} from 'material-definitions'
import {defaultInterfaces} from 'raxa-common/lib/default-interfaces'
import {DeviceType, GraphQlDevice} from 'raxa-common/lib/entities'
import React, {
  ReactElement,
  ReactNode,
  cloneElement,
  createContext,
} from 'react'
import {graphql} from 'react-apollo/graphql'
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from 'react-beautiful-dnd'
import styled from 'react-emotion'
import {compose, mapProps, withHandlers, withStateHandlers} from 'recompose'
import {Theme} from '../../../theme'
import {withInnerState} from '../../../with-lazy-reducer'
import {WidgetComponent, WidgetProps} from '../widget'
import {ButtonWidget} from './button'
import {CurrentlyPlayingWidget} from './currently-playing'
import {DisplayWidget} from './display'
import {LightWidget} from './light'
import {ReceiverWidget} from './receiver'

const LazyDragDropContext = loadable(
  () => import('react-beautiful-dnd').then(module => module.DragDropContext),
  {
    render: ({Component, loading, ownProps}) => {
      if (loading) return (ownProps as any).children
      return <Component {...ownProps} />
    },
  },
)
const LazyDraggable = loadable(
  () => import('react-beautiful-dnd').then(module => module.Draggable),
  {
    render: ({Component, loading, ownProps}) => {
      if (loading)
        return ownProps.children(
          {
            draggableProps: {},
            dragHandleProps: {},
          } as any,
          {isDragging: false},
        )
      return <Component {...ownProps} />
    },
  },
)
const LazyDroppable = loadable(
  () => import('react-beautiful-dnd').then(module => module.Droppable),
  {
    render: ({Component, loading, ownProps}) => {
      if (loading)
        return ownProps.children(
          {
            droppableProps: {},
          } as any,
          {isDraggingOver: false},
        )
      return <Component {...ownProps} />
    },
  },
)

export type WidgetConfiguration = {
  hidden: Array<string>
  sortOrder: Array<string>
}

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
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const Container = styled('div')<{row: boolean}>(({row}) => ({
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

const ListHeader = styled(ListSubheader)<{}, Theme>(({theme}) => ({
  '&&': {
    display: 'flex',
    zIndex: 2,
    backgroundColor: theme.dark
      ? theme.background.main
      : theme.background.light,
  },
}))

const dragContainerStyles = (row: boolean) => ({
  flexGrow: row ? 1 : undefined,
  flexBasis: row ? '25%' : undefined,
  width: row ? undefined : '100%',
})

const DeviceWrapperContainer = styled('div')<
  {
    row: boolean
    big?: boolean
    border: boolean
  },
  Theme
>(({row, big = false, border, theme}) => ({
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
  inEditMode,
  isHidden,
  ...props
}: {
  row: boolean
  big?: boolean
  border: boolean
  inEditMode: boolean
  isHidden: boolean
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
    {inEditMode && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(${
            isHidden ? '150, 150, 150' : '255, 255, 255'
          }, 0.7)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      />
    )}
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
  configuration?: WidgetConfiguration
  setConfiguration: (config: Partial<WidgetConfiguration>) => void
  header?: string
}
export type ListWidgetPrivateProps = Pick<
  ListWidgetProps,
  Exclude<keyof ListWidgetProps, 'configuration'>
> & {
  configuration: WidgetConfiguration
  row: boolean
  data: {devices?: Array<GraphQlDevice>}
  onSortEnd: (result: any) => void
  setData: (data: {devices?: Array<GraphQlDevice>}) => void
  disabledSort: Array<string>
  enableSort: (deviceId: string) => void
  disableSort: (deviceId: string) => void
  inEditMode: boolean
  startEditMode: (e: React.MouseEvent<HTMLElement>) => void
  stopEditMode: (e: React.MouseEvent<HTMLElement>) => void
}

export const enhance = compose<ListWidgetPrivateProps, ListWidgetProps>(
  mapProps((props: ListWidgetProps) => ({
    ...props,
    row: props.row || !props.column,
    configuration: Array.isArray(props.configuration)
      ? {sortOrder: props.configuration, hidden: []}
      : props.configuration || {sortOrder: [], hidden: []},
  })),
  graphql(
    gql`
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
      props.data.devices && props.configuration
        ? {
            ...props.data,
            devices: sortByOrder(
              props.configuration.sortOrder,
              props.data.devices,
            ),
          }
        : props.data,
  })),
  withInnerState('data', 'setData'),
  withStateHandlers(
    {disabledSort: [] as Array<string>, inEditMode: false},
    {
      startEditMode: () => (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        return {inEditMode: true}
      },
      stopEditMode: () => () => ({
        inEditMode: false,
      }),
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
      setConfiguration,
    }: ListWidgetPrivateProps) => result => {
      // dropped outside the list
      if (!result.destination) {
        return
      }

      const sorted = reorder(
        data.devices!,
        result.source.index,
        result.destination.index,
      )
      setData({...data, devices: sorted})
      setConfiguration({sortOrder: sorted.map(d => d.id)})
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
  enableSort,
  disableSort,
  disabledSort,
  inEditMode,
  startEditMode,
  stopEditMode,
  configuration,
  setConfiguration,
}: ListWidgetPrivateProps) =>
  data.devices && data.devices.length > 0 ? (
    <div onContextMenu={startEditMode}>
      <LazyDragDropContext onDragEnd={onSortEnd}>
        {header && (
          <ListHeader color="default">
            <span style={{flex: 1}}>{header}</span>
            {inEditMode && (
              <IconButton onClick={stopEditMode}>
                <DoneIcon />
              </IconButton>
            )}
          </ListHeader>
        )}
        <LazyDroppable
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
                .devices!.filter(
                  device =>
                    inEditMode || !configuration.hidden.includes(device.id),
                )
                .map(
                  (
                    device,
                  ): null | [boolean, GraphQlDevice, ReactElement<any>] =>
                    device.interfaceIds
                      ? device.types!.includes(DeviceType.Thermometer) &&
                        (!interfaceIds ||
                          interfaceIds.includes(
                            defaultInterfaces.Temperature.id,
                          ))
                        ? [
                            false,
                            device,
                            <DisplayWidget
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
                              device,
                              <ButtonWidget
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
                                device,
                                <CurrentlyPlayingWidget
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
                                  device,
                                  <ReceiverWidget
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
                                    device,
                                    <LightWidget
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
                    [
                      disableInteractiveElementBlocking,
                      device,
                      innerWidget,
                    ]: any,
                    i,
                  ) => (
                    <Hideable key={device.id!}>
                      {(hideComponent, isHidden) =>
                        isHidden ? (
                          cloneElement(innerWidget, {
                            hideComponent,
                          })
                        ) : (
                          <LazyDraggable
                            draggableId={device.id}
                            index={i}
                            isDragDisabled={
                              !inEditMode ||
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
                                  onClick={
                                    inEditMode
                                      ? e => {
                                          e.stopPropagation()
                                          setConfiguration({
                                            hidden: configuration.hidden.includes(
                                              device.id,
                                            )
                                              ? configuration.hidden.filter(
                                                  d => d !== device.id,
                                                )
                                              : [
                                                  ...configuration.hidden,
                                                  device.id,
                                                ],
                                          })
                                        }
                                      : undefined
                                  }
                                >
                                  <DeviceWrapper
                                    row={row}
                                    big={big}
                                    border={i > 0}
                                    innerRef={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={provided.draggableProps.style as any}
                                    inEditMode={inEditMode}
                                    isHidden={
                                      inEditMode &&
                                      configuration.hidden.includes(device.id)
                                    }
                                  >
                                    {cloneElement(innerWidget, {hideComponent})}
                                  </DeviceWrapper>
                                </div>
                              </draggingContext.Provider>
                            )}
                          </LazyDraggable>
                        )
                      }
                    </Hideable>
                  ),
                )}
            </Container>
          )}
        </LazyDroppable>
      </LazyDragDropContext>
    </div>
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
