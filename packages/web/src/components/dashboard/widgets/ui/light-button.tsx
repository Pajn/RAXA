import glamorous from 'glamorous'
import {purple} from 'material-definitions'
import React from 'react'
import {RTCard} from '../../../../toolbox/theme.js'

export const CircleButton = glamorous(
  ({big: _, ...props}: {big?: boolean} & React.HTMLProps<HTMLButtonElement>) =>
    <button
      {...props}
      className={`${RTCard.card} ${props.className}`}
      onMouseUp={e => {
        const target = e.target as HTMLButtonElement
        const isMouse = e.screenX || e.screenY
        target.blur()
        setTimeout(() => {
          if (isMouse) {
          }
        }, 10)
        if (props.onClick) {
          {
            /*props.onClick(e)*/
          }
        }
      }}
    />,
)(({big}: {big?: boolean}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  border: '4px solid white',

  ':not(#id)': {
    marginLeft: 4,
    marginRight: 4,
    padding: 0,
    width: big ? 64 : 40,
    height: big ? 64 : 40,

    backgroundColor: '#eee',
    borderRadius: '50%',
  },

  ':focus': {
    borderColor: '#eee',
    outline: 'none',
  },
}))

export const DimButton = ({
  color = purple[500],
  ...props,
}: {
  color?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}) =>
  <CircleButton {...props}>
    <svg width="100%" height="100%">
      <path
        d="m 0,16 c 0,0 8,-6 16,0 8,6 16,-6 16,0 v 16 h -32 v -16 z"
        fill={color}
      />
    </svg>
  </CircleButton>

export const DimLevelButton = ({
  color = purple[500],
  level,
  ...props,
}: {
  color?: string
  level: number
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}) =>
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

export const ColorButton = ({
  color,
  ...props,
}: {
  big?: boolean
  color: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}) =>
  <CircleButton type="button" {...props}>
    <div
      style={{
        width: 64,
        height: 64,
        backgroundColor: color,
      }}
    />
  </CircleButton>
