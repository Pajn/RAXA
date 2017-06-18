import glamorous from 'glamorous'
import {GraphQlDevice} from 'raxa-common/lib/entities'
import React from 'react'
import {gql, graphql} from 'react-apollo/lib'
import {ContainerQuery} from 'react-container-query'
import {compose, mapProps} from 'recompose'
import {WidgetComponent, WidgetProps} from '../widget'
import {ButtonWidget} from './button'
import {LightWidget} from './light'

const Container = glamorous.div<{row: boolean}>(({row}) => ({
  display: 'flex',
  flexDirection: row ? 'row' : 'column',
  alignItems: row ? 'center' : 'flex-start',
  justifyContent: row ? 'center' : 'flex-start',
  height: '100%',
}))

const DeviceWrapper = glamorous.div<{row: boolean}>(({row}) => ({
  position: 'relative',
  boxSizing: 'border-box',
  padding: row ? 16 : 8,
  height: 56,
  width: row ? 128 : '100%',
  boxShadow: row
    ? `
      0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12)`
    : 'none',

  '& + &': {
    marginLeft: row ? 24 : undefined,
    paddingTop: row ? undefined : 16,
    borderTop: row ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
  },
}))

export type ListWidgetConfiguration = {
  interfaceIds?: Array<string>
}
export type ListWidgetProps = WidgetProps<ListWidgetConfiguration>
export type ListWidgetPrivateProps = ListWidgetProps & {
  interfaceIds?: Array<string>
  data: {devices?: Array<GraphQlDevice>}
}

export const enhance = compose<ListWidgetPrivateProps, ListWidgetProps>(
  mapProps((props: ListWidgetProps) => ({
    ...props,
    interfaceIds: props.config.interfaceIds,
  })),
  graphql(gql`
    query ($interfaceIds: [String!]) {
      devices(interfaceIds: $interfaceIds) {
        id
        name
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
)

export const ListWidgetView = ({data}: ListWidgetPrivateProps) =>
  <ContainerQuery
    query={{
      row: {
        maxHeight: 200,
        minWidth: 201,
      },
    }}
  >
    {({row}) =>
      <Container row={row}>
        {data.devices &&
          data.devices
            .map(
              device =>
                device.interfaceIds
                  ? device.interfaceIds!.includes('Scenery')
                    ? <ButtonWidget
                        config={{
                          deviceId: device.id,
                          interfaceId: 'Scenery',
                          method: 'set',
                        }}
                      />
                    : device.interfaceIds!.includes('Light') ||
                        device.interfaceIds!.includes('Dimmer')
                      ? <LightWidget config={{deviceId: device.id}} />
                      : null
                  : null,
            )
            .map(
              (innerWidget, i) =>
                innerWidget &&
                <DeviceWrapper key={i} row={row}>{innerWidget}</DeviceWrapper>,
            )}
      </Container>}
  </ContainerQuery>

export const ListWidget: WidgetComponent = Object.assign(
  enhance(ListWidgetView),
  {
    type: 'ListWidget',
    uiName: 'Device List',
    defaultSize: {width: 5, height: 2},
    demoConfig: {interfaceIds: ['Scenery', 'Light', 'Dimmer']},
  },
)
