import PropTypes from 'prop-types'
import React from 'react'
import {getContext, wrapDisplayName} from 'recompose'

export type InputMoveEventsListener = {
  onMove?: (event: React.MouseEvent<any> | React.TouchEvent<any>) => void
  onUp?: (event: React.MouseEvent<any> | React.TouchEvent<any>) => void
  onCancel?: (event?: React.MouseEvent<any> | React.TouchEvent<any>) => void

  onMouseMove?: (event: React.MouseEvent<any>) => void
  onTouchMove?: (event: React.TouchEvent<any>) => void

  onMouseUp?: (event: React.MouseEvent<any>) => void
  onTouchEnd?: (event: React.TouchEvent<any>) => void
  onTouchCancel?: (event: React.TouchEvent<any>) => void
}

export type InputClickEventsListener = {
  onClick?: (event: React.MouseEvent<any>) => void
  onDown?: (event: React.MouseEvent<any> | React.TouchEvent<any>) => void
  onCancel?: (event?: React.MouseEvent<any> | React.TouchEvent<any>) => void

  onMouseDown?: (event: React.MouseEvent<any>) => void
  onTouchStart?: (event: React.TouchEvent<any>) => void
}

export type InjectedInputEventsProps = {
  onMoveEvents: (listener: InputMoveEventsListener) => Promise<void>
  onClickEvents: (listener: InputClickEventsListener) => void

  haveClickListeners: boolean
  haveMoveListeners: boolean
  haveInputListeners: boolean

  cancelClickListeners: () => void
  cancelMoveListeners: () => void
  cancelInputListeners: () => void
}

export type InjectedInputEventsContainerProps = InjectedInputEventsProps &
  InputClickEventsListener & {
    onMouseMove?: (event: React.MouseEvent<any>) => void
    onTouchMove?: (event: React.TouchEvent<any>) => void
    onMouseUp?: (event: React.MouseEvent<any>) => void
    onTouchEnd?: (event: React.TouchEvent<any>) => void
    onTouchCancel?: (event: React.TouchEvent<any>) => void
  }

export const inputEventsContext: {
  [K in keyof InjectedInputEventsProps]: PropTypes.Validator<any>
} = {
  onMoveEvents: PropTypes.func,
  onClickEvents: PropTypes.func,

  haveClickListeners: PropTypes.bool,
  haveMoveListeners: PropTypes.bool,
  haveInputListeners: PropTypes.bool,

  cancelClickListeners: PropTypes.func,
  cancelMoveListeners: PropTypes.func,
  cancelInputListeners: PropTypes.func,
}

export const withInputEvents = getContext<
  InjectedInputEventsProps,
  InjectedInputEventsProps
>(inputEventsContext)

export const inputEventsContainer = () => (
  WrappedComponent: React.ComponentType<InjectedInputEventsContainerProps>,
) =>
  class extends React.Component<
    {},
    {
      moveListener?: InputMoveEventsListener
      clickListeners: Set<InputClickEventsListener>
    }
  > {
    static displayName = wrapDisplayName(WrappedComponent, 'withInputEvents')
    static childContextTypes = inputEventsContext
    onMoveCancel: (
      event?: React.MouseEvent<any> | React.TouchEvent<any>,
    ) => void

    constructor() {
      super()
      this.state = {
        clickListeners: new Set(),
      }
    }

    onMoveEvents = (moveListener: InputMoveEventsListener) =>
      new Promise<void>(resolve => {
        this.onMoveCancel = event => {
          this.setState({moveListener: undefined})
          resolve()
          if (event && moveListener.onUp) {
            moveListener.onUp(event)
          }
          if (moveListener.onCancel) {
            moveListener.onCancel(event)
          }
        }
        this.setState({moveListener})
      })

    onClickEvents = (listener: InputClickEventsListener) => {
      this.state.clickListeners.add(listener)
      this.setState({})
    }

    deleteClickListener = (listener: InputClickEventsListener) => {
      this.state.clickListeners.delete(listener)
      this.setState({})
    }

    cancelClickListeners = () => {
      for (const listener of this.state.clickListeners) {
        if (listener.onCancel) {
          listener.onCancel()
          this.deleteClickListener(listener)
        }
      }
    }

    onMouseMove = (event: React.MouseEvent<any>) => {
      const {moveListener} = this.state
      if (moveListener) {
        if (moveListener.onMouseMove) moveListener.onMouseMove(event)
        if (moveListener.onMove) moveListener.onMove(event)
      }
    }
    onTouchMove = (event: React.TouchEvent<any>) => {
      const {moveListener} = this.state
      if (moveListener) {
        if (moveListener.onTouchMove) moveListener.onTouchMove(event)
        if (moveListener.onMove) moveListener.onMove(event)
      }
    }
    onMouseUp = (event: React.MouseEvent<any>) => {
      const {moveListener} = this.state
      if (moveListener) {
        if (moveListener.onMouseUp) moveListener.onMouseUp(event)
        this.onMoveCancel(event)
      }
    }
    onTouchEnd = (event: React.TouchEvent<any>) => {
      const {moveListener} = this.state
      if (moveListener) {
        if (moveListener.onTouchEnd) moveListener.onTouchEnd(event)
        this.onMoveCancel(event)
      }
    }
    onTouchCancel = (event: React.TouchEvent<any>) => {
      const {moveListener} = this.state
      if (moveListener) {
        if (moveListener.onTouchCancel) moveListener.onTouchCancel(event)
        this.onMoveCancel(event)
      }
    }

    onClick = (event: React.MouseEvent<any>) => {
      for (const listener of this.state.clickListeners) {
        if (listener.onClick) {
          listener.onClick(event)
          this.deleteClickListener(listener)
        }
      }
    }
    onMouseDown = (event: React.MouseEvent<any>) => {
      for (const listener of this.state.clickListeners) {
        if (listener.onMouseDown) {
          listener.onMouseDown(event)
          if (!listener.onClick) this.deleteClickListener(listener)
        }
        if (listener.onDown) {
          listener.onDown(event)
          if (!listener.onClick) this.deleteClickListener(listener)
        }
        if (listener.onCancel) {
          listener.onCancel(event)
          if (!listener.onClick) this.deleteClickListener(listener)
        }
      }
    }
    onTouchStart = (event: React.TouchEvent<any>) => {
      for (const listener of this.state.clickListeners) {
        if (listener.onTouchStart) {
          listener.onTouchStart(event)
          if (!listener.onClick) this.deleteClickListener(listener)
        }
        if (listener.onDown) {
          listener.onDown(event)
          if (!listener.onClick) this.deleteClickListener(listener)
        }
        if (listener.onCancel) {
          listener.onCancel(event)
          if (!listener.onClick) this.deleteClickListener(listener)
        }
      }
    }

    getChildContext(): InjectedInputEventsProps {
      return {
        onMoveEvents: this.onMoveEvents,
        onClickEvents: this.onClickEvents,
        haveClickListeners: this.state.clickListeners.size > 0,
        haveMoveListeners: !!this.state.moveListener,
        haveInputListeners:
          this.state.clickListeners.size > 0 || !!this.state.moveListener,
        cancelClickListeners: this.cancelClickListeners,
        cancelMoveListeners: () => this.onMoveCancel(),
        cancelInputListeners: () => {
          this.cancelClickListeners()
        },
      }
    }

    render() {
      return (
        <WrappedComponent
          {...this.getChildContext()}
          {...this.state.clickListeners.size > 0 && {
            onClick: this.onClick,
            onMouseDown: this.onMouseDown,
            onTouchStart: this.onTouchStart,
          }}
          {...this.state.moveListener && {
            onMouseMove: this.onMouseMove,
            onTouchMove: this.onTouchMove,
            onMouseUp: this.onMouseUp,
            onTouchEnd: this.onTouchEnd,
            onTouchCancel: this.onTouchCancel,
            onMoveEvents: this.onMoveEvents,
            onClickEvents: this.onClickEvents,
          }}
        />
      )
    }
  }
