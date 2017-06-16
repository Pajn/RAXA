import glamorous from 'glamorous'
import React from 'react'
import {compose, withHandlers} from 'recompose'
import {materialColors} from 'styled-material/dist/src/colors'
import {
  InjectedInputEventsProps,
  withInputEvents,
} from '../../with-input-events/with-input-events'

export type HandleProps = (
  | {top: true; left?: undefined; right?: undefined; bottom?: undefined}
  | {left: true; top?: undefined; right?: undefined; bottom?: undefined}
  | {right: true; top?: undefined; left?: undefined; bottom?: undefined}
  | {bottom: true; top?: undefined; left?: undefined; right?: undefined}) & {
  visible: boolean
}

export type HandlePrivateProps = HandleProps & InjectedInputEventsProps & {}

const enhance = compose<HandleProps, HandleProps>(
  withInputEvents,
  withHandlers<
    HandlePrivateProps,
    HandlePrivateProps
  >(({top, bottom, onMoveEvents}) => ({
    onMouseDown: () => (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      const startPosition = {x: event.clientX, y: event.clientY}

      onMoveEvents({
        onMouseMove(event) {
          if (top || bottom) {
            const diff = startPosition.y - event.clientY
            console.log('Y', diff)
          } else {
            const diff = startPosition.x - event.clientX
            console.log('X', diff)
          }
        },
      })
    },
  })),
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

  background: materialColors['blue-400'],
  border: 0,
  borderRadius: '50%',

  transform: visible ? `scale(1)` : `scale(0)`,
  pointerEvents: visible ? undefined : 'none',

  transition: 'transform 150ms ease-in',

  ':hover, :active': {
    transform: visible ? `scale(1.1)` : `scale(0)`,
    cursor: top || bottom ? 'ns-resize' : 'ew-resize',
  },
}))

export const Handle = enhance(HandleView)

export const HandleContainer = glamorous.div<{
  visible: boolean
}>(({visible}) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',

  border: `4px solid ${materialColors['blue-400']}`,

  opacity: visible ? 1 : 0,
  transition: 'opacity 150ms ease-in',
}))
