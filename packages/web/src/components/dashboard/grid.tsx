import glamorous from 'glamorous'
import React from 'react'
import {compose} from 'recompose'
import {connectState} from '../../with-lazy-reducer'
import {DashboardState, dashboardState} from './state'

export const Grid = glamorous.div({position: 'relative'})

export type CellProps = {
  x: number
  y: number
  width: number
  height: number
}
export type FullCellProps = CellProps & React.HTMLProps<HTMLDivElement>

export const xCellToPx = (state: DashboardState, x: number) =>
  state.gridSize.startX +
  x * (state.gridSettings.cellWidth + state.gridSize.gap)

export const yCellToPx = (state: DashboardState, y: number) =>
  state.gridSize.startY +
  y * (state.gridSettings.cellHeight + state.gridSize.gap)

export const xPxToCell = (state: DashboardState, x: number) =>
  Math.round(
    (x - state.gridSize.startX) /
      (state.gridSettings.cellWidth + state.gridSize.gap),
  )

export const yPxToCell = (state: DashboardState, y: number) =>
  Math.round(
    (y - state.gridSize.startY) /
      (state.gridSettings.cellHeight + state.gridSize.gap),
  )

const enhance = compose<FullCellProps, FullCellProps>(
  connectState(dashboardState, (state, {x, y, width, height}: CellProps) => {
    x = Math.max(Math.min(x, state.gridSettings.cols - width), 0)
    y = Math.max(Math.min(y, state.gridSettings.rows - height), 0)

    return {
      x: xCellToPx(state, x),
      y: yCellToPx(state, y),
      width:
        width * state.gridSettings.cellWidth + (width - 1) * state.gridSize.gap,
      height:
        height * state.gridSettings.cellHeight +
          (height - 1) * state.gridSize.gap,
    }
  }),
)

export const CellView = ({
  x,
  y,
  width,
  height,
  ...htmlProps,
}: CellProps & React.HTMLProps<HTMLDivElement>) =>
  <div
    {...htmlProps}
    style={{
      ...htmlProps.style,
      position: 'absolute',
      top: y,
      left: x,
      width,
      height,
    }}
  />

export const Cell = enhance(CellView)
