import glamorous from 'glamorous'
import {shadow} from 'material-definitions'
import {DeviceType, GraphQlDevice, defaultInterfaces} from 'raxa-common'
import React from 'react'
import {gql, graphql} from 'react-apollo'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'
import {compose, mapProps, withHandlers, withStateHandlers} from 'recompose'
import {withInnerState} from '../../../with-lazy-reducer'
import {WidgetComponent, WidgetProps} from '../widget'
import {ButtonWidget} from './button'
import {DisplayWidget} from './display'
import {LightWidget} from './light'
import {ReceiverWidget} from './receiver'

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

const Container = SortableContainer(
  glamorous.div<{row: boolean}>(({row}) => ({
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
  })),
)

const DeviceWrapper = SortableElement(
  glamorous.div<{row: boolean}>(({row}) => ({
    position: 'relative',
    flexGrow: row ? 1 : undefined,
    flexBasis: row ? '25%' : undefined,
    boxSizing: 'border-box',
    margin: row ? 8 : 0,
    padding: row ? 16 : 8,
    width: row ? undefined : '100%',
    height: row ? 48 : 56,
    overflow: 'hidden',

    backgroundColor: 'white',
    boxShadow: row ? shadow[1].boxShadow : 'none',

    '& + &': {
      borderTop: row ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
    },
  })),
)

export type ListWidgetConfiguration = {
  interfaceIds?: Array<string>
}
export type ListWidgetProps = WidgetProps<ListWidgetConfiguration> & {
  row?: true
  column?: true
  sortOrder?: Array<string>
  setSortOrder?: (sortOrder: Array<string>) => void
}
export type ListWidgetPrivateProps = ListWidgetProps & {
  row: boolean
  interfaceIds?: Array<string>
  data: {devices?: Array<GraphQlDevice>}
  onSortEnd: (c: {oldIndex: number; newIndex: number}) => void
  setData: (data: {devices?: Array<GraphQlDevice>}) => void
  canSort: boolean
  disabledSort: Array<string>
  enableSort: (deviceId: string) => void
  disableSort: (deviceId: string) => void
}

export const enhance = compose<ListWidgetPrivateProps, ListWidgetProps>(
  mapProps((props: ListWidgetProps) => ({
    ...props,
    interfaceIds: props.config.interfaceIds,
    row: props.row || !props.column,
  })),
  graphql(gql`
    query($interfaceIds: [String!]) {
      devices(interfaceIds: $interfaceIds) {
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
    onSortEnd: ({data, setData, setSortOrder}: ListWidgetPrivateProps) => ({
      oldIndex,
      newIndex,
    }) => {
      if (setSortOrder) {
        const sorted = arrayMove(data.devices!, oldIndex, newIndex)
        setData({...data, devices: sorted})
        setSortOrder(sorted.map(d => d.id))
      }
    },
  }),
)

export const ListWidgetView = ({
  data,
  row,
  interfaceIds,
  onSortEnd,
  canSort,
  enableSort,
  disableSort,
  disabledSort,
}: ListWidgetPrivateProps) => (
  <Container
    row={row}
    pressDelay={300}
    axis={row ? 'xy' : 'y'}
    onSortEnd={onSortEnd}
  >
    {data.devices &&
      data.devices
        .map(
          device =>
            device.interfaceIds ? (
              device.types!.includes(DeviceType.Thermometer) &&
              (!interfaceIds ||
                interfaceIds.includes(defaultInterfaces.Temperature.id)) ? (
                <DisplayWidget
                  key={device.id}
                  config={{
                    deviceId: device.id,
                    interfaceId: defaultInterfaces.Temperature.id,
                    statusId: defaultInterfaces.Temperature.status.temp.id,
                  }}
                />
              ) : device.interfaceIds!.includes('Scenery') &&
              (!interfaceIds || interfaceIds.includes('Scenery')) ? (
                <ButtonWidget
                  key={device.id}
                  config={{
                    deviceId: device.id,
                    interfaceId: 'Scenery',
                    method: 'set',
                  }}
                />
              ) : device.interfaceIds!.includes('SonyReceiver') &&
              (!interfaceIds || interfaceIds.includes('SonyReceiver')) ? (
                <ReceiverWidget
                  key={device.id}
                  config={{
                    deviceId: device.id,
                  }}
                />
              ) : (device.types!.includes(DeviceType.Light) ||
                device.types!.includes(DeviceType.Outlet)) &&
              (!interfaceIds ||
                interfaceIds.includes(defaultInterfaces.Power.id) ||
                interfaceIds.includes(defaultInterfaces.Dimmer.id)) ? (
                <LightWidget
                  key={device.id}
                  config={{deviceId: device.id}}
                  enableSort={enableSort}
                  disableSort={disableSort}
                />
              ) : null
            ) : null,
        )
        .map(
          (innerWidget, i) =>
            innerWidget && (
              <DeviceWrapper
                key={innerWidget.key!}
                index={i}
                row={row}
                disabled={
                  !canSort || disabledSort.includes(data.devices![i].id)
                }
              >
                {innerWidget}
              </DeviceWrapper>
            ),
        )}
  </Container>
)

export const ListWidget: WidgetComponent<
  ListWidgetConfiguration,
  ListWidgetProps
> = Object.assign(enhance(ListWidgetView), {
  type: 'ListWidget',
  uiName: 'Device List',
  defaultSize: {width: 5, height: 2},
  demoConfig: {interfaceIds: ['Scenery', 'Light', 'Dimmer']},
})
