import {keyframes} from 'glamor'
import glamorous from 'glamorous'
import React from 'react'
import {Card} from 'react-toolbox/lib/card'
import {compose, withHandlers, withState} from 'recompose'
import {Title} from 'styled-material/dist/src/typography'
import {
  InjectedInputEventsProps,
  withInputEvents,
} from '../../with-input-events/with-input-events'
import {connectState} from '../../with-lazy-reducer'
import {CellProps, xPxToCell, yPxToCell} from './grid'
import {DashboardState, dashboardState} from './state'
import {WidgetComponent} from './widget'

const fadeInUp = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(100%)',
  },
  '100%': {
    opacity: 1,
    transform: '',
  },
})

const Container = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  bottom: 0,
  width: '100%',

  animation: `${fadeInUp} 300ms ease-out`,
})

const WidgetDisplayContainer = glamorous.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: 24,

  cursor: 'grab',
  ':active': {cursor: 'move'},
})

const DraggingWidget = glamorous.div({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  cursor: 'move',
  transformOrigin: '50% 50%',
})

const WidgetCard = glamorous(Card)({
  padding: 8,
})

const WidgetName = glamorous(Title)({
  padding: 8,
  color: 'white',
})

type WidgetDisplayProps = {widget: WidgetComponent}
type WidgetDisplayPrivateProps = WidgetDisplayProps &
  InjectedInputEventsProps & {
    position?: {x: number; y: number}
    setPosition: (position?: {x: number; y: number}) => void
    grabWidget: (event: React.MouseEvent<any>) => void
    dashboardState: DashboardState
    setGhost: (ghost: CellProps) => void
  }

function lerp(start: number, end: number, t: number) {
  return (1 - t) * start + t * end
}

const enhanceDisplay = compose<WidgetDisplayPrivateProps, WidgetDisplayProps>(
  connectState(dashboardState, 'dashboardState', dispatch => ({
    setGhost: ghost => dispatch({type: 'setGhost', ghost}),
  })),
  withState('position', 'setPosition', undefined),
  withInputEvents,
  withHandlers(
    ({onMoveEvents, setPosition, setGhost}: WidgetDisplayPrivateProps) => ({
      grabWidget: ({widget, dashboardState}: WidgetDisplayPrivateProps) => (
        event: React.MouseEvent<void>,
      ) => {
        const startPosition = {x: event.clientX, y: event.clientY}
        let rendered = false

        const widgetPos = (event: React.MouseEvent<void>) => ({
          ...widget.defaultSize,
          x: xPxToCell(
            dashboardState,
            lerp(
              48 - dashboardState.gridSize.startX,
              dashboardState.gridSize.endX,
              event.clientX / dashboardState.gridSize.width,
            ) *
              (1 / 0.7),
          ),
          y: yPxToCell(
            dashboardState,
            lerp(
              24 - dashboardState.gridSize.startY,
              dashboardState.gridSize.endY,
              event.clientY / dashboardState.gridSize.height,
            ) *
              (1 / 0.7),
          ),
        })

        onMoveEvents({
          onMouseMove(event) {
            const deltaX = event.clientX - startPosition.x
            const deltaY = event.clientY - startPosition.y
            if (!rendered) {
              const distance = Math.sqrt(
                Math.abs(deltaX) ** 2 + Math.abs(deltaY) ** 2,
              )
              if (distance > 10) {
                rendered = true
              }
            }
            if (rendered) {
              setPosition({x: deltaX, y: deltaY})
              // const height = 24 + dashboardState.gridSize.endY * 0.7
              setGhost(widgetPos(event))
            }
          },
          onMouseUp(event) {
            console.log(event.target)
            setPosition()
            const widgetPosition = widgetPos(event)
            if (widgetPosition) {
              // add widget
            }
          },
        })
      },
    }),
  ),
)

const WidgetDisplayView = ({
  widget: Widget,
  position,
  grabWidget,
}: WidgetDisplayPrivateProps) =>
  <WidgetDisplayContainer onMouseDown={grabWidget}>
    <WidgetCard raised>
      <Widget config={Widget.demoConfig} />
    </WidgetCard>
    <WidgetName>{Widget.uiName}</WidgetName>
    {position &&
      <DraggingWidget
        style={{transform: `translate(${position.x}px, ${position.y}px)`}}
      >
        <WidgetCard raised>
          <Widget config={Widget.demoConfig} />
        </WidgetCard>
      </DraggingWidget>}
  </WidgetDisplayContainer>

const WidgetDisplay = enhanceDisplay(WidgetDisplayView)

export type WidgetDrawerProps = {widgetTypes: {[name: string]: WidgetComponent}}
export type WidgetDrawerPrivateProps = WidgetDrawerProps & {}

export const enhance = compose<WidgetDrawerPrivateProps, WidgetDrawerProps>()

export const WidgetDrawerView = ({widgetTypes}: WidgetDrawerPrivateProps) =>
  <Container>
    {Object.entries(widgetTypes).map(([id, widget]) =>
      <WidgetDisplay key={id} widget={widget} />,
    )}
  </Container>

export const WidgetDrawer = enhance(WidgetDrawerView)
