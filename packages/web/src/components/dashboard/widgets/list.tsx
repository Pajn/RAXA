import glamorous from 'glamorous'
import {shadow} from 'material-definitions'
import {DeviceType, GraphQlDevice} from 'raxa-common'
import React from 'react'
import {gql, graphql} from 'react-apollo'
import {compose, mapProps} from 'recompose'
import {WidgetComponent, WidgetProps} from '../widget'
import {ButtonWidget} from './button'
import {DisplayWidget} from './display'
import {LightWidget} from './light'

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

const DeviceWrapper = glamorous.div<{row: boolean}>(({row}) => ({
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
}))

export type ListWidgetConfiguration = {
  interfaceIds?: Array<string>
}
export type ListWidgetProps = WidgetProps<ListWidgetConfiguration> & {
  row?: true
  column?: true
}
export type ListWidgetPrivateProps = ListWidgetProps & {
  row: boolean
  interfaceIds?: Array<string>
  data: {devices?: Array<GraphQlDevice>}
}

export const enhance = compose<ListWidgetPrivateProps, ListWidgetProps>(
  mapProps((props: ListWidgetProps) => ({
    ...props,
    interfaceIds: props.config.interfaceIds,
    row: props.row || !props.column,
  })),
  graphql(gql`
    query ($interfaceIds: [String!]) {
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
)

export const ListWidgetView = ({data, row}: ListWidgetPrivateProps) =>
  <Container row={row}>
    {data.devices &&
      data.devices
        .map(
          device =>
            device.interfaceIds
              ? device.types!.includes(DeviceType.Thermometer)
                ? <DisplayWidget
                    config={{
                      deviceId: device.id,
                      interfaceId: 'Temperature',
                      statusId: 'temp',
                    }}
                  />
                : device.interfaceIds!.includes('Scenery')
                  ? <ButtonWidget
                      config={{
                        deviceId: device.id,
                        interfaceId: 'Scenery',
                        method: 'set',
                      }}
                    />
                  : device.types!.includes(DeviceType.Light)
                    ? <LightWidget config={{deviceId: device.id}} />
                    : null
              : null,
        )
        .map(
          (innerWidget, i) =>
            innerWidget &&
            <DeviceWrapper key={i} row={row}>{innerWidget}</DeviceWrapper>,
        )}
  </Container>

export const ListWidget: WidgetComponent<
  ListWidgetConfiguration,
  ListWidgetProps
> = Object.assign(enhance(ListWidgetView), {
  type: 'ListWidget',
  uiName: 'Device List',
  defaultSize: {width: 5, height: 2},
  demoConfig: {interfaceIds: ['Scenery', 'Light', 'Dimmer']},
})
