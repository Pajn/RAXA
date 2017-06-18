import glamorous from 'glamorous'
import React from 'react'
import {materialColors} from 'styled-material/dist/src/colors'
import {RTCard} from '../../../../toolbox/theme.js'

export const CircleButton = glamorous(
  (props: React.HTMLProps<HTMLButtonElement>) =>
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
)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  border: '4px solid white',

  ':not(#id)': {
    marginLeft: 4,
    marginRight: 4,
    padding: 0,
    width: 40,
    height: 40,

    backgroundColor: '#eee',
    borderRadius: '50%',
  },

  ':focus': {
    borderColor: '#eee',
    outline: 'none',
  },
})

export const DimButton = ({
  color = materialColors['purple-500'],
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
  color = materialColors['purple-500'],
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
