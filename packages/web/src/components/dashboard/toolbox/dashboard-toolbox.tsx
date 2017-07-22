import glamorous from 'glamorous'
import React from 'react'
import {compose} from 'recompose'
import {lifecycle} from 'recompose'
import {connectState} from '../../../with-lazy-reducer'
import {InjectedPushStateProps, withPushState} from '../../ui/with-push-state'
import {dashboardState} from '../state'
import {ToolboxContainer} from './ui'
import {WidgetConfiguration} from './widget-configuration'
import {WidgetDrawer} from './widget-drawer'

const ToolContainer = glamorous.a({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  margin: 24,
  width: 128,
  height: 128,

  color: 'rgba(255, 255, 255, 0.7)',
  textDecoration: 'none',

  cursor: 'default',
})

type ToolboxPages = 'widgets' | 'editWidget' | 'toolbox'

const Tool = ({
  name,
  page,
  pushState,
}: {
  name: string
  page: ToolboxPages
  pushState: DashboardToolboxPrivateProps['pushState']
}) =>
  <ToolContainer onClick={() => pushState({data: {page}, title: name})}>
    {name}
  </ToolContainer>

export type DashboardToolboxProps = {}
export type DashboardToolboxPrivateProps = DashboardToolboxProps &
  InjectedPushStateProps<{page: ToolboxPages}> & {activeWidget?: string}

export const enhance = compose<
  DashboardToolboxPrivateProps,
  DashboardToolboxProps
>(
  withPushState(),
  connectState(dashboardState, state => ({activeWidget: state.activeWidget})),
  lifecycle({
    componentWillReceiveProps(nextProps: DashboardToolboxPrivateProps) {
      if (this.props.activeWidget !== nextProps.activeWidget) {
        if (nextProps.activeWidget) {
          if (nextProps.state) {
            nextProps.replaceState({
              data: {page: 'editWidget'},
              title: 'Edit Widget',
            })
          } else {
            nextProps.pushState({
              data: {page: 'editWidget'},
              title: 'Edit Widget',
            })
          }
        } else if (nextProps.state) {
          nextProps.replaceState({
            data: {page: 'toolbox'},
            title: 'Toolbox',
          })
        }
      }
      if (
        nextProps.state &&
        nextProps.state.data.page === 'editWidget' &&
        !nextProps.activeWidget
      ) {
        nextProps.replaceState({
          data: {page: 'toolbox'},
          title: 'Toolbox',
        })
      }
    },
  }),
)

export const DashboardToolboxView = ({
  state,
  pushState,
  activeWidget,
}: DashboardToolboxPrivateProps) =>
  <div
    onClick={event => event.stopPropagation()}
    onMouseDown={event => event.stopPropagation()}
  >
    {state && state.data.page === 'widgets' && <WidgetDrawer />}
    {activeWidget &&
      state &&
      state.data.page === 'editWidget' &&
      <WidgetConfiguration widgetId={activeWidget} />}
    {(!state ||
      (!activeWidget && state && state.data.page === 'editWidget') ||
      state.data.page === 'toolbox') &&
      <ToolboxContainer>
        <Tool name="Widgets" page="widgets" pushState={pushState} />
      </ToolboxContainer>}
  </div>

export const DashboardToolbox = enhance(DashboardToolboxView)
