import React from 'react'
import {Card} from 'react-toolbox/lib/card'
import {compose, withHandlers, withState} from 'recompose'
import {Cell, CellProps} from '../../grid/grid'
import {
  InjectedInputEventsProps,
  withInputEvents,
} from '../../with-input-events/with-input-events'
import {Handle, HandleContainer} from './handle'

export type WidgetProps<T = any> = {
  config: T
}

export type WidgetWrapperProps = CellProps & {
  children: React.ReactNode
  editMode?: boolean
  setGhost: (position?: CellProps) => void
  setPosition: (position: CellProps) => void
}

export type WidgetWrapperPrivateProps = WidgetWrapperProps &
  InjectedInputEventsProps & {
    showHandles: boolean
    setShowHandles: (showHandles: boolean) => void
    translate?: {x: number; y: number}
    setTranslate: (translate?: {x: number; y: number}) => void
    transformOrigin?: {x: number; y: number}
    setTransformOrigin: (transformOrigin?: {x: number; y: number}) => void
    startDrag: (event: React.MouseEvent<any>) => void
    doShowHandles: (event: React.MouseEvent<any>) => void
  }

export const enhance = compose<WidgetWrapperPrivateProps, WidgetWrapperProps>(
  withState('showHandles', 'setShowHandles', false),
  withState('translate', 'setTranslate', undefined),
  withState('transformOrigin', 'setTransformOrigin', undefined),
  withInputEvents,
  withHandlers<
    WidgetWrapperPrivateProps,
    WidgetWrapperPrivateProps
  >(
    ({
      onClickEvents,
      onMoveEvents,
      setShowHandles,
      setTranslate,
      setTransformOrigin,
      cancelClickListeners,
      setPosition,
    }) => ({
      startDrag: ({translate, x, y, width, height, setGhost}) => (
        event: React.MouseEvent<any>,
      ) => {
        event.stopPropagation()
        const startPosition = {x: event.clientX, y: event.clientY}
        setTransformOrigin(startPosition)

        onMoveEvents({
          onMouseMove(event) {
            const diffX = (event.clientX - startPosition.x) * (1 / 0.7)
            const diffY = (event.clientY - startPosition.y) * (1 / 0.7)
            translate = {x: diffX, y: diffY}
            setTranslate(translate)
            const cellDiffX = Math.round(translate.x / (48 + 16))
            const cellDiffY = Math.round(translate.y / (48 + 16))
            setGhost({x: x + cellDiffX, y: y + cellDiffY, width, height})
          },
          onCancel() {
            if (translate) {
              const cellDiffX = Math.round(translate.x / (48 + 16))
              const cellDiffY = Math.round(translate.y / (48 + 16))
              setPosition({x: x + cellDiffX, y: y + cellDiffY, width, height})
              setTranslate()
            }
          },
        })
      },
      doShowHandles: ({editMode}) => (event: React.MouseEvent<any>) => {
        event.stopPropagation()
        if (editMode) {
          cancelClickListeners()
          setShowHandles(true)
          onClickEvents({
            onCancel() {
              setShowHandles(false)
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
  transformOrigin,
  startDrag,
  doShowHandles,
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
              translate && `translate(${translate.x}px, ${translate.y}px)`,
            transformOrigin:
              transformOrigin &&
                `${transformOrigin.x}px, ${transformOrigin.y}px`,
          }
        : undefined
    }
    onMouseDown={startDrag}
    onClick={doShowHandles}
  >
    <Card raised style={{padding: 8, height: '100%'}}>
      {children}
    </Card>
    {editMode &&
      <HandleContainer visible={showHandles}>
        <Handle top visible={showHandles} />
        <Handle left visible={showHandles} />
        <Handle right visible={showHandles} />
        <Handle bottom visible={showHandles} />
      </HandleContainer>}
  </Cell>

export const Widget = enhance(WidgetView)
