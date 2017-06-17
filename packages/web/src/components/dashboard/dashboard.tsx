import glamorous from 'glamorous'
import React from 'react'
import {compose} from 'recompose'
import {withHandlers} from 'recompose'
import withState from 'recompose/withState'
import {Cell, CellProps, Grid} from '../../grid/grid'
import {
  InjectedInputEventsContainerProps,
  inputEventsContainer,
} from '../../with-input-events/with-input-events'
import {withLazyReducer} from '../../with-lazy-reducer'
import {ContextActions} from '../ui/scaffold/context-actions'
import {Widget, WidgetProps} from './widget'
import {DisplayWidget} from './widgets/display'
import {LightWidget} from './widgets/light'

const widgetTypes = {
  DisplayWidget,
  LightWidget,
}

const widgets: Array<
  WidgetProps & {type: keyof typeof widgetTypes; position: CellProps}
> = [
  {
    type: 'DisplayWidget',
    position: {
      x: 0,
      y: 0,
      width: 3,
      height: 1,
    },
    config: {
      deviceId: '1490980661126',
      interfaceId: 'Temperature',
      statusId: 'temp',
    },
  },
  {
    type: 'LightWidget',
    position: {
      x: 5,
      y: 0,
      width: 3,
      height: 1,
    },
    config: {
      deviceId: '1490977902528',
    },
  },
  {
    type: 'LightWidget',
    position: {
      x: 5,
      y: 1,
      width: 3,
      height: 2,
    },
    config: {
      deviceId: '1490977902528',
    },
  },
  {
    type: 'LightWidget',
    position: {
      x: 5,
      y: 3,
      width: 5,
      height: 1,
    },
    config: {
      deviceId: '1490977902528',
    },
  },
]

const Container = glamorous.div<{editMode: boolean}>({
  display: 'flex',
  flex: 1,

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

  backgroundColor: 'white',

  filter: editMode ? `brightness(0.9)` : undefined,
  transform: editMode ? `translateY(24px) scale(0.7)` : undefined,
  transformOrigin: '50% 0',
  transition: `
    filter 200ms 50ms ease,
    transform 300ms ease
  `,
}))

const Ghost = glamorous(Cell)({
  backgroundColor: 'rgba(0, 0, 0, 0.12)',
  borderRadius: 3,
})

export type DashboardPrivateProps = InjectedInputEventsContainerProps & {
  editMode: boolean
  setEditMode: (editMode: boolean) => void
  onContextMenu: (event: React.MouseEvent<any>) => void
  ghost?: CellProps
  setGhost: (ghost?: CellProps) => void
}

const enhance = compose<DashboardPrivateProps, {}>(
  inputEventsContainer(),
  withState('editMode', 'setEditMode', true),
  withLazyReducer<CellProps | undefined, CellProps | undefined>(
    'ghost',
    'setGhost',
    (ghost, position) =>
      (ghost && !position) ||
        (!ghost && position) ||
        (ghost &&
          position &&
          (position.x !== ghost.x ||
            position.y !== ghost.y ||
            position.width !== ghost.width ||
            position.height !== ghost.height))
        ? position
        : ghost,
    undefined,
  ),
  withHandlers<DashboardPrivateProps, DashboardPrivateProps>({
    onContextMenu: ({setEditMode}) => (event: React.MouseEvent<any>) => {
      if (!event.ctrlKey) {
        event.preventDefault()
        setEditMode(true)
      }
    },
  }),
)

export const DashboardView = ({
  editMode,
  setEditMode,
  ghost,
  setGhost,
  onContextMenu,
  haveInputListeners,
  ...eventListeners,
}: DashboardPrivateProps) =>
  <Container
    onClick={
      haveInputListeners
        ? undefined
        : () => {
            setEditMode(false)
          }
    }
    {...eventListeners}
    editMode={editMode}
    onContextMenu={onContextMenu}
  >
    <ContextActions
      contextActions={[
        {label: 'Settings', href: '/settings', icon: 'settings'},
      ]}
    />
    <Workspace cols={10} rows={10} gap="16px" editMode={editMode}>
      {ghost && <Ghost {...ghost} />}
      {widgets.map((props, i) => {
        const WidgetType = widgetTypes[props.type]
        return (
          <Widget
            key={i}
            {...props.position}
            editMode={editMode}
            setGhost={setGhost}
            setPosition={position => {
              Object.assign(props.position, {
                x: Math.min(10, Math.max(0, position.x)),
                y: Math.min(10, Math.max(0, position.y)),
                width: position.width,
                height: position.height,
              })
            }}
          >
            <WidgetType config={props.config} />
          </Widget>
        )
      })}
    </Workspace>
  </Container>

export const Dashboard = enhance(DashboardView)
