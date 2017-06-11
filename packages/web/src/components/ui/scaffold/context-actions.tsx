import deepEqual from 'deep-equal'
import React from 'react'
import compose from 'recompose/compose'
import getContext from 'recompose/getContext'
import lifecycle from 'recompose/lifecycle'
import {ContextAction, ScaffoldContext, scaffoldContextType} from './context'

export type ContextActionsProps = {
  contextActions: Array<ContextAction>
}
export type PrivateContextActionsProps = ContextActionsProps & ScaffoldContext & {}

export const enhance = compose(
  getContext(scaffoldContextType),
  lifecycle({
    componentDidMount() {
      const {contextActions, setContextActions} = this.props as PrivateContextActionsProps
      setContextActions(contextActions)
    },
    componentWillReceiveProps(nextProps: PrivateContextActionsProps) {
      if (!deepEqual(nextProps.contextActions, this.props.contextActions)) {
        const {contextActions, setContextActions} = nextProps
        setContextActions(contextActions)
      }
    },
    componentWillUnmount() {
      const {clearContextActions} = this.props as PrivateContextActionsProps
      clearContextActions()
    },
  })
)

export const ContextActionsView = ({}: PrivateContextActionsProps) => null

export const ContextActions = enhance(ContextActionsView) as React.ComponentClass<ContextActionsProps>
