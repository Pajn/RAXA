import glamorous from 'glamorous'
import {grey} from 'material-definitions'
import React from 'react'
import {compose} from 'recompose'
import {withHandlers} from 'recompose'
import {lifecycle} from 'recompose'
import {
  InjectedInputEventsContainerProps,
  inputEventsContainer,
} from '../../with-input-events/with-input-events'
import {provideState} from '../../with-lazy-reducer'
import {Size, withSize} from '../../with-size'
import {ContextActions} from '../ui/scaffold/context-actions'
import {Cell, Grid} from './grid'
import {DashboardAction, DashboardState, dashboardState} from './state'
import {DashboardToolbox} from './toolbox/dashboard-toolbox'
import {Widget} from './widget'

const debugGrid = false

const Container = glamorous.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',

  backgroundColor: '#333',
})

const Workspace = glamorous(
  Grid,
  {rootEl: 'div', forwardProps: ['cols', 'rows', 'gap']} as any,
)<{
  editMode: boolean
}>(({editMode}) => ({
  display: 'flex',
  flex: 1,

  backgroundColor: grey[100],

  filter: editMode ? `brightness(0.98)` : undefined,
  transform: editMode ? `translateY(24px) scale(0.7)` : undefined,
  transformOrigin: '50% 0',
  transition: `
    filter 200ms 50ms ease,
    transform 300ms ease
  `,
}))

const Ghost = props =>
  <Cell
    {...props}
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      borderRadius: 3,
    }}
  />

export type DashboardPrivateProps = InjectedInputEventsContainerProps & {
  setEditMode: (editMode: boolean) => void
  onContextMenu: (event: React.MouseEvent<any>) => void
  state: DashboardState
  size?: Size
  setGridSize: (size: Size) => void
}

const enhance = compose<DashboardPrivateProps, {}>(
  inputEventsContainer(),
  provideState<
    DashboardState,
    DashboardAction,
    DashboardPrivateProps
  >(dashboardState, 'state', dispatch => ({
    setEditMode: editMode => dispatch({type: 'setEditMode', editMode}),
    setGridSize: size => dispatch({type: 'setGridSize', size}),
  })),
  withHandlers<DashboardPrivateProps, DashboardPrivateProps>({
    onContextMenu: ({setEditMode}) => (event: React.MouseEvent<any>) => {
      if (!event.ctrlKey) {
        event.preventDefault()
        setEditMode(true)
      }
    },
  }),
  withSize(),
  lifecycle({
    componentWillReceiveProps(nextProps: DashboardPrivateProps) {
      if (this.props.size !== nextProps.size && nextProps.size) {
        nextProps.setGridSize(nextProps.size)
      }
    },
  }),
)

export const DashboardView = ({
  setEditMode,
  state,
  onContextMenu,
  haveInputListeners,
  size: _,
  ...eventListeners,
}: DashboardPrivateProps) =>
  <Container
    onClick={
      state.editMode && !haveInputListeners
        ? () => setEditMode(false)
        : undefined
    }
    {...eventListeners}
    onContextMenu={onContextMenu}
  >
    <ContextActions
      contextActions={[
        {label: 'Settings', href: '/settings', icon: 'settings'},
      ]}
    />
    <Workspace editMode={state.editMode}>
      {debugGrid &&
        Array.from({length: state.gridSettings.cols}).map((_, col) =>
          Array.from({length: state.gridSettings.rows}).map((_, row) =>
            <Ghost x={col} y={row} width={1} height={1} />,
          ),
        )}
      {state.ghost && <Ghost {...state.ghost} />}
      {state.widgets.map(props => {
        const WidgetType = state.widgetTypes[props.type]
        return (
          <Widget key={props.id} id={props.id} {...props.position}>
            <WidgetType config={props.config} />
          </Widget>
        )
      })}
    </Workspace>
    {state.editMode && <DashboardToolbox />}
  </Container>

export const Dashboard = enhance(DashboardView)
