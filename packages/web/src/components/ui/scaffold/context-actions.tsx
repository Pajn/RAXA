import deepEqual from 'deep-equal'
import React from 'react'
import {compose, getContext, lifecycle} from 'recompose'
import {ContextAction, ScaffoldContext, scaffoldContextType} from './context'

export type ContextActionsProps = {
  contextActions: Array<ContextAction>
}
export type PrivateContextActionsProps = ContextActionsProps &
  ScaffoldContext & {}

export const enhance = compose<PrivateContextActionsProps, ContextActionsProps>(
  getContext(scaffoldContextType),
  lifecycle<PrivateContextActionsProps, PrivateContextActionsProps>({
    componentDidMount() {
      const {contextActions, setContextActions} = this
        .props as PrivateContextActionsProps
      setContextActions(contextActions)
    },
    componentWillReceiveProps(nextProps: PrivateContextActionsProps) {
      if (
        nextProps.contextActions !== this.props.contextActions &&
        !deepEqual(nextProps.contextActions, this.props.contextActions)
      ) {
        const {contextActions, setContextActions} = nextProps
        setContextActions(contextActions)
      }
    },
    componentWillUnmount() {
      const {clearContextActions} = this.props as PrivateContextActionsProps
      clearContextActions()
    },
  }),
)

export const ContextActionsView = ({}: PrivateContextActionsProps) => null

export const ContextActions = enhance(
  ContextActionsView,
) as React.ComponentClass<ContextActionsProps>
