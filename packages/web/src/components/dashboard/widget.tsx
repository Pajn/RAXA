import {Property} from 'raxa-common'
import React from 'react'
import {Card} from 'react-toolbox/lib/card'
import {compose, withHandlers, withState} from 'recompose'
import {
  InjectedInputEventsProps,
  withInputEvents,
} from '../../with-input-events/with-input-events'
import {connectState} from '../../with-lazy-reducer'
import {
  Cell,
  CellProps,
  xCellToPx,
  xPxToCell,
  yCellToPx,
  yPxToCell,
} from './grid'
import {Handle, HandleContainer} from './handle'
import {DashboardState, dashboardState} from './state'

export type WidgetProps<T = any> = {
  config: T
}

export type WidgetComponent<T = any, P = {}> = React.ComponentClass<
  WidgetProps<T> & P
> & {
  type: string
  defaultSize: {width: number; height: number}
  demoConfig: T
  uiName: string
  config?: {[id: string]: Property}
}

export type WidgetWrapperProps = CellProps & {
  id: string
  children: React.ReactNode
  editMode?: boolean
}

export type WidgetWrapperPrivateProps = WidgetWrapperProps &
  InjectedInputEventsProps & {
    showHandles: boolean
    setGhost: (position?: CellProps) => void
    setActive: (active: boolean) => void
    setPosition: (position: CellProps) => void
    translate?: {x: number; y: number}
    setTranslate: (translate?: {x: number; y: number}) => void
    scale?: {x: number; y: number}
    setScale: (translate?: {x: number; y: number}) => void
    startMove: (event: React.MouseEvent<any>) => void
    doShowHandles: (event: React.MouseEvent<any>) => void
    onResize: (
      done: boolean,
    ) => (
      delta: {x: number; y: number},
      position: {
        top?: boolean
        left?: boolean
        right?: boolean
        bottom?: boolean
      },
    ) => void
    dashboardState: DashboardState
  }

export const enhance = compose<WidgetWrapperPrivateProps, WidgetWrapperProps>(
  connectState(
    dashboardState,
    (state, props: WidgetWrapperProps) => ({
      editMode: state.editMode,
      showHandles: state.activeWidget === props.id,
      dashboardState: state,
    }),
    (dispatch, props) => ({
      setGhost: (ghost?: CellProps) => dispatch({type: 'setGhost', ghost}),
      setActive: (active: boolean) =>
        dispatch({
          type: 'setActiveWidget',
          widgetId: active ? props.id : undefined,
        }),
      setPosition: (position: CellProps) =>
        dispatch({type: 'updateWidget', widget: {id: props.id, position}}),
    }),
  ),
  withState('translate', 'setTranslate', undefined),
  withState('scale', 'setScale', undefined),
  withInputEvents,
  withHandlers<
    WidgetWrapperPrivateProps,
    WidgetWrapperPrivateProps
  >(
    ({
      onClickEvents,
      onMoveEvents,
      setActive,
      setTranslate,
      setScale,
      cancelClickListeners,
      setPosition,
      setGhost,
    }) => ({
      startMove: ({x, y, width, height, dashboardState}) => (
        event: React.MouseEvent<any>,
      ) => {
        event.stopPropagation()
        const startPosition = {x: event.clientX, y: event.clientY}
        const startGrid = {
          x: xCellToPx(dashboardState, x),
          y: yCellToPx(dashboardState, y),
        }

        onMoveEvents({
          onMouseMove(event) {
            const deltaX = (event.clientX - startPosition.x) * (1 / 0.7)
            const deltaY = (event.clientY - startPosition.y) * (1 / 0.7)
            setTranslate({x: deltaX, y: deltaY})
            setGhost({
              x: xPxToCell(dashboardState, startGrid.x + deltaX),
              y: yPxToCell(dashboardState, startGrid.y + deltaY),
              width,
              height,
            })
          },
          onMouseUp(event) {
            const deltaX = (event.clientX - startPosition.x) * (1 / 0.7)
            const deltaY = (event.clientY - startPosition.y) * (1 / 0.7)
            setTranslate()
            setPosition({
              x: xPxToCell(dashboardState, startGrid.x + deltaX),
              y: yPxToCell(dashboardState, startGrid.y + deltaY),
              width,
              height,
            })
          },
        })
      },
      onResize: ({x, y, width, height, dashboardState}) => done => (
        delta: {x: number; y: number},
        position: {
          top?: boolean
          left?: boolean
          right?: boolean
          bottom?: boolean
        },
      ) => {
        const startGrid = {
          x: position.right ? x + width : x,
          y: position.bottom ? y + height : y,
        }
        const currentGrid = {
          x: xPxToCell(
            dashboardState,
            xCellToPx(dashboardState, startGrid.x) + delta.x * (1 / 0.7),
          ),
          y: yPxToCell(
            dashboardState,
            yCellToPx(dashboardState, startGrid.y) + delta.y * (1 / 0.7),
          ),
        }
        const newPosition = {x, y, width, height}
        if (position.top) {
          const deltaY = startGrid.y - currentGrid.y
          newPosition.y = y + deltaY
          newPosition.height = height - deltaY
        } else if (position.bottom) {
          const deltaY = startGrid.y - currentGrid.y
          newPosition.height = height + deltaY
        }
        if (position.left) {
          const deltaX = startGrid.x - currentGrid.x
          newPosition.x = x + deltaX
          newPosition.width = width - deltaX
        } else if (position.right) {
          const deltaX = startGrid.x - currentGrid.x
          newPosition.width = width + deltaX
        }
        if (done) {
          setScale()
          setTranslate()
          setPosition(newPosition)
        } else {
          setGhost(newPosition)
        }
      },
      doShowHandles: ({editMode}) => (event: React.MouseEvent<any>) => {
        event.stopPropagation()
        if (editMode) {
          cancelClickListeners()
          setActive(true)
          onClickEvents({
            onCancel() {
              setActive(false)
            },
            onClick: () => {},
          })
        }
      },
    }),
  ),
)

export const WidgetView = ({
  children,
  editMode,
  showHandles,
  translate,
  scale,
  startMove,
  doShowHandles,
  onResize,
  x,
  y,
  width,
  height,
}: WidgetWrapperPrivateProps) =>
  <Cell
    x={x}
    y={y}
    width={width}
    height={height}
    style={
      editMode
        ? {
            position: 'relative',
            transform:
              (translate &&
                scale &&
                `translate(${translate.x}px, ${translate.y}px) scale(${scale.x}, ${scale.y})`) ||
                (translate &&
                  `translate(${translate.x}px, ${translate.y}px)`) ||
                (scale && `scale(${scale.x}, ${scale.y})`),
          }
        : undefined
    }
    onMouseDown={editMode ? startMove : undefined}
    onClick={editMode ? doShowHandles : undefined}
  >
    <Card style={{position: 'relative', padding: 8, height: '100%'}}>
      {children}
    </Card>
    {editMode &&
      <HandleContainer visible={showHandles}>
        <Handle
          top
          visible={showHandles}
          onDragMove={onResize(false)}
          onDragDone={onResize(true)}
        />
        <Handle
          left
          visible={showHandles}
          onDragMove={onResize(false)}
          onDragDone={onResize(true)}
        />
        <Handle
          right
          visible={showHandles}
          onDragMove={onResize(false)}
          onDragDone={onResize(true)}
        />
        <Handle
          bottom
          visible={showHandles}
          onDragMove={onResize(false)}
          onDragDone={onResize(true)}
        />
        <Handle
          top
          left
          visible={showHandles}
          onDragMove={onResize(false)}
          onDragDone={onResize(true)}
        />
        <Handle
          top
          right
          visible={showHandles}
          onDragMove={onResize(false)}
          onDragDone={onResize(true)}
        />
        <Handle
          bottom
          left
          visible={showHandles}
          onDragMove={onResize(false)}
          onDragDone={onResize(true)}
        />
        <Handle
          bottom
          right
          visible={showHandles}
          onDragMove={onResize(false)}
          onDragDone={onResize(true)}
        />
      </HandleContainer>}
  </Cell>

export const Widget = enhance(WidgetView)
