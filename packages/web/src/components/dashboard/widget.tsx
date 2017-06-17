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
    scale?: {x: number; y: number}
    setScale: (translate?: {x: number; y: number}) => void
    transformOrigin?: {x: number | string; y: number | string}
    setTransformOrigin: (
      transformOrigin?: {x: number | string; y: number | string},
    ) => void
    startMove: (event: React.MouseEvent<any>) => void
    doShowHandles: (event: React.MouseEvent<any>) => void
    onResize: (
      direction: 'width' | 'height',
      negative?: 'negative',
      done?: 'done',
    ) => (delta: number) => void
  }

export const enhance = compose<WidgetWrapperPrivateProps, WidgetWrapperProps>(
  withState('showHandles', 'setShowHandles', false),
  withState('translate', 'setTranslate', undefined),
  withState('scale', 'setScale', undefined),
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
      setScale,
      setTransformOrigin,
      cancelClickListeners,
      setPosition,
    }) => ({
      startMove: ({translate, x, y, width, height, setGhost}) => (
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
      onResize: ({x, y, width, height, setGhost}) => (
        direction,
        negative,
        done,
      ) => delta => {
        const normalizedDelta = negative ? -delta : delta
        const origSize = (direction === 'width' ? width : height) * (48 + 16)
        const cellDiff = (normalizedDelta + origSize) / origSize
        let position: CellProps
        if (direction === 'width') {
          const newWidth = Math.round(cellDiff * width)
          const newX = negative ? x : x - (newWidth - width)
          position = {x: newX, y, width: newWidth, height}
        } else {
          const newHeight = Math.round(cellDiff * height)
          const newY = negative ? y : y - (newHeight - height)
          position = {x, y: newY, width, height: newHeight}
        }
        if (done) {
          setScale()
          setTranslate()
          setPosition(position)
        } else {
          let translate = -delta / 2
          setGhost(position)
          if (direction === 'width') {
            setScale({x: cellDiff, y: 1})
            setTranslate({x: translate, y: 0})
            setTransformOrigin({x: '50%', y: negative ? '100%' : 0})
          } else {
            setScale({x: 1, y: cellDiff})
            setTranslate({x: 0, y: translate})
            setTransformOrigin({x: negative ? '100%' : 0, y: '50%'})
          }
        }
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
  scale,
  transformOrigin,
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
            transformOrigin:
              transformOrigin &&
                `${transformOrigin.x}px, ${transformOrigin.y}px`,
          }
        : undefined
    }
    onMouseDown={startMove}
    onClick={doShowHandles}
  >
    <Card raised style={{padding: 8, height: '100%'}}>
      {children}
    </Card>
    {editMode &&
      <HandleContainer visible={showHandles}>
        <Handle
          top
          visible={showHandles}
          onDragMove={onResize('height')}
          onDragDone={onResize('height', undefined, 'done')}
        />
        <Handle
          left
          visible={showHandles}
          onDragMove={onResize('width')}
          onDragDone={onResize('width', undefined, 'done')}
        />
        <Handle
          right
          visible={showHandles}
          onDragMove={onResize('width', 'negative')}
          onDragDone={onResize('width', 'negative', 'done')}
        />
        <Handle
          bottom
          visible={showHandles}
          onDragMove={onResize('height', 'negative')}
          onDragDone={onResize('height', 'negative', 'done')}
        />
      </HandleContainer>}
  </Cell>

export const Widget = enhance(WidgetView)
