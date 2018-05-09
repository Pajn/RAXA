import glamorous from 'glamorous'
import {purple} from 'material-definitions'
import {ButtonProps} from 'material-ui/Button'
import ButtonBase from 'material-ui/ButtonBase/ButtonBase'
import Paper, {PaperProps} from 'material-ui/Paper/Paper'
import React from 'react'

export const CircleButton = glamorous(
  Paper as React.ComponentType<PaperProps & ButtonProps>,
  {
    withProps: {
      component: ButtonBase,
      onMouseUp: e => {
        const target: HTMLElement = e.currentTarget
        target.blur()
      },
    },
  },
)(({big}: {big?: boolean}) => ({
  width: big ? 64 : 40,
  height: big ? 64 : 40,
  overflow: 'hidden' as 'hidden',

  backgroundColor: '#eee',

  '&&': {
    display: 'flex' as 'flex',
    marginLeft: 4,
    marginRight: 4,
    border: '4px solid white',
    borderRadius: '50%',
  },

  ':focus': {
    borderColor: '#eee',
    outline: 'none',
  },
}))

export const DimButton = ({
  color = purple[500],
  ...props
}: {
  color?: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}) => (
  <CircleButton {...props}>
    <svg width="100%" height="100%">
      <path
        d="m 0,16 c 0,0 8,-6 16,0 8,6 16,-6 16,0 v 16 h -32 v -16 z"
        fill={color}
      />
    </svg>
  </CircleButton>
)

export const DimLevelButton = ({
  color = purple[500],
  level,
  ...props
}: {
  color?: string
  level: number
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}) => (
  <CircleButton {...props}>
    <div
      style={{
        marginTop: (1 - level) * 32,
        width: 32,
        height: 32,
        backgroundColor: color,
      }}
    />
  </CircleButton>
)

export const ColorButton = ({
  color,
  ...props
}: {
  big?: boolean
  color: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}) => (
  <CircleButton type="button" {...props}>
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: color,
      }}
    />
  </CircleButton>
)
