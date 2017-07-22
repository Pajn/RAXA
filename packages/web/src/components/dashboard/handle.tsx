import glamorous from 'glamorous'
import {blue} from 'material-definitions'
import React from 'react'
import {compose, pure, withHandlers} from 'recompose'
import {setDisplayName} from 'recompose'
import {
  InjectedInputEventsProps,
  withInputEvents,
} from '../../with-input-events/with-input-events'

export type HandleProps = (
  | {top: true; left?: true; right?: undefined; bottom?: undefined}
  | {left: true; top?: undefined; right?: undefined; bottom?: true}
  | {right: true; top?: true; left?: undefined; bottom?: undefined}
  | {bottom: true; top?: undefined; left?: undefined; right?: true}) & {
  visible: boolean
  onDragMove?: (
    delta: {x: number; y: number},
    position: {
      top?: boolean
      left?: boolean
      right?: boolean
      bottom?: boolean
    },
  ) => void
  onDragDone?: (
    delta: {x: number; y: number},
    position: {
      top?: boolean
      left?: boolean
      right?: boolean
      bottom?: boolean
    },
  ) => void
}

export type HandlePrivateProps = HandleProps & InjectedInputEventsProps & {}

const enhance = compose<HandleProps, HandleProps>(
  pure,
  withInputEvents,
  withHandlers<HandlePrivateProps, HandlePrivateProps>(({onMoveEvents}) => ({
    onMouseDown: ({onDragMove, onDragDone, top, left, right, bottom}) => (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.stopPropagation()
      const startPosition = {x: event.clientX, y: event.clientY}

      onMoveEvents({
        onMouseMove(event) {
          if (onDragMove !== undefined) {
            onDragMove(
              {
                x: startPosition.x - event.clientX,
                y: startPosition.y - event.clientY,
              },
              {
                top,
                left,
                right,
                bottom,
              },
            )
          }
        },
        onMouseUp(event) {
          if (onDragDone !== undefined) {
            onDragDone(
              {
                x: startPosition.x - event.clientX,
                y: startPosition.y - event.clientY,
              },
              {
                top,
                left,
                right,
                bottom,
              },
            )
          }
        },
      })
    },
  })),
  setDisplayName('HandleView'),
)

export const HandleView = glamorous.button<
  HandleProps
>(({top, left, right, bottom, visible}) => ({
  position: 'absolute',
  top: top ? -11.4 : bottom ? 'calc(100% - 11.4px)' : 'calc(50% - 11.4px)',
  left: left ? -11.4 : right ? 'calc(100% - 11.4px)' : 'calc(50% - 11.4px)',
  padding: 0,
  width: 22.8,
  height: 22.8,

  background: blue[400],
  border: 0,
  borderRadius: '50%',

  transform: visible ? `scale(1)` : `scale(0)`,
  pointerEvents: visible ? undefined : 'none',

  transition: 'transform 150ms ease-in',

  ':hover, :active': {
    transform: visible ? `scale(1.1)` : `scale(0)`,
    cursor: (top && left) || (bottom && right)
      ? 'nwse-resize'
      : (top && right) || (bottom && left)
        ? 'nesw-resize'
        : top || bottom ? 'ns-resize' : 'ew-resize',
  },
}))

export const Handle = enhance(HandleView)

export type HandleContainerProps = {
  visible: boolean
}

const enhanceContainer = compose<HandleContainerProps, HandleContainerProps>(
  pure,
  setDisplayName('HandleContainerView'),
)

export const HandleContainerView = glamorous.div<
  HandleContainerProps
>(({visible}) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1000,

  boxSizing: 'border-box',
  width: '100%',
  height: '100%',

  border: `4px solid ${blue[400]}`,

  opacity: visible ? 1 : 0,
  transition: 'opacity 150ms ease-in',
}))

export const HandleContainer = enhanceContainer(HandleContainerView)
