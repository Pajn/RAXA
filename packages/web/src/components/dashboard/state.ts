import {updateIn} from 'redux-decorated'
import {StorageConfiguration} from '../../with-lazy-reducer'
import {Size} from '../../with-size'
import {CellProps} from './grid'
import {WidgetComponent, WidgetProps} from './widget'
import {ButtonWidget} from './widgets/button'
import {DisplayWidget} from './widgets/display'
import {LightWidget} from './widgets/light'

export type WidgetTypes = {[name: string]: WidgetComponent}
export type WidgetConfig = WidgetProps & {
  id: string
  type: string
  position: CellProps
}

export type DashboardState = {
  gridSettings: {
    cols: number
    rows: number
    cellHeight: number
    cellWidth: number
    maxGap: number
  }
  gridSize: {
    width: number
    height: number
    gap: number
    startX: number
    startY: number
    endX: number
    endY: number
  }
  activeWidget?: string
  editMode: boolean
  ghost?: CellProps
  widgets: Array<WidgetConfig>
  widgetTypes: WidgetTypes
}
export type DashboardAction =
  | {type: 'setActiveWidget'; widgetId?: string}
  | {type: 'setGhost'; ghost?: CellProps}
  | {type: 'setEditMode'; editMode: boolean}
  | {type: 'setGridSize'; size: Size}
  | {type: 'addWidget'; widget: WidgetConfig}
  | {type: 'updateWidget'; widget: Partial<WidgetConfig> & {id: string}}

const widgets: DashboardState['widgets'] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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

const widgetTypes: WidgetTypes = {
  ButtonWidget,
  DisplayWidget,
  LightWidget,
}

export const dashboardState: StorageConfiguration<
  DashboardState,
  DashboardAction
> = {
  id: 'dashboard',
  initialState: {
    gridSettings: {
      cols: 10,
      rows: 10,
      cellHeight: 48,
      cellWidth: 48,
      maxGap: 24,
    },
    gridSize: {
      width: 0,
      height: 0,
      gap: 0,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
    },
    editMode: true,
    widgets,
    widgetTypes,
  },
  reducer(state, action) {
    console.log('action', action)
    switch (action.type) {
      case 'setActiveWidget':
        return {...state, activeWidget: action.widgetId}
      case 'setGhost':
        if (
          (state.ghost && !action.ghost) ||
          (!state.ghost && action.ghost) ||
          (state.ghost &&
            action.ghost &&
            (action.ghost.x !== state.ghost.x ||
              action.ghost.y !== state.ghost.y ||
              action.ghost.width !== state.ghost.width ||
              action.ghost.height !== state.ghost.height))
        ) {
          return {...state, ghost: action.ghost}
        } else {
          return state
        }
      case 'setEditMode':
        return {
          ...state,
          editMode: action.editMode,
          activeWidget: action.editMode ? state.activeWidget : undefined,
          ghost: action.editMode ? state.ghost : undefined,
        }
      case 'setGridSize':
        const gapX =
          (action.size.width -
            state.gridSettings.cols * state.gridSettings.cellWidth) /
            (state.gridSettings.cols - 1) || 0

        const gapY =
          (action.size.height -
            state.gridSettings.rows * state.gridSettings.cellHeight) /
            (state.gridSettings.rows - 1) || 0

        const gap = Math.min(Math.min(gapX, gapY), state.gridSettings.maxGap)

        const width =
          state.gridSettings.cols * state.gridSettings.cellWidth +
          (gap * (state.gridSettings.cols - 1) || 0)

        const height =
          state.gridSettings.rows * state.gridSettings.cellHeight +
          (gap * (state.gridSettings.rows - 1) || 0)

        const startX = (action.size.width - width) / 2
        const startY = (action.size.height - height) / 2
        const endX = startX + width
        const endY = startY + height

        return {
          ...state,
          gridSize: {
            ...action.size,
            gap,
            startX,
            startY,
            endX,
            endY,
          },
        }
      case 'addWidget':
        return {
          ...state,
          activeWidget: action.widget.id,
          widgets: state.widgets.concat(action.widget),
        }
      case 'updateWidget':
        const index = state.widgets.findIndex(
          widget => widget.id === action.widget.id,
        )
        return {
          ...state,
          activeWidget: action.widget.id,
          widgets: updateIn(
            index,
            {...state.widgets[index], ...action.widget},
            state.widgets,
          ),
        }
    }
  },
}
