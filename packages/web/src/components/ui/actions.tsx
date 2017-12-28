import glamorous from 'glamorous'
import {History, Location} from 'history'
import {grey} from 'material-definitions'
import React from 'react'
import {withRouter} from 'react-router'
import {ButtonProps, IconButtonProps} from 'react-toolbox/lib/button'
import Button from 'react-toolbox/lib/button/Button'
import BadIconButton from 'react-toolbox/lib/button/IconButton'
import IconMenu from 'react-toolbox/lib/menu/IconMenu'
import MenuItem from 'react-toolbox/lib/menu/MenuItem'
import {withMedia} from 'react-with-media'
import {compose} from 'recompose'
import {row} from 'style-definitions'

declare module 'react-toolbox/lib/menu/MenuItem' {
  interface MenuItemProps {
    type?: string
    form?: string
  }
}

declare module 'react-toolbox/lib/menu/IconMenu' {
  interface IconMenuProps {
    inverse?: boolean
  }
}

const IconButton = (BadIconButton as any) as React.ComponentType<
  IconButtonProps & {form?: string}
>

export type Placement = 'menu' | 'toolbar' | 'auto'

export type Action = {
  disabled?: boolean
  label?: string
  href?: string
  icon?: string
  onClick?: () => void
  /**
   * Determines if the action is placed as a separate icon or in the menu
   * @default auto
   */
  placement?: Placement
  form?: string
  type?: string
}

export type ActionsProps = {
  actions: Array<Action>
  /**
   * Set to true when rendered on a dark background to use light icons instead.
   * @default false
   */
  inverse?: boolean
  /**
   * Determines the position of the menu. This property is transferred to the inner Menu component.
   * @default auto
   */
  position?:
    | 'auto'
    | 'static'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
  style?: React.CSSProperties
}
export type ActionsPrivateProps = ActionsProps & {
  isMobile: boolean
} & {
    location: Location
    history: History
  }

const ActionRow = glamorous.div(
  row({horizontal: 'flex-end', vertical: 'center'}),
)
const ActionButton = glamorous<ButtonProps & {type?: string; form?: string}>(
  Button,
)({
  '&[data-react-toolbox="button"]': {
    minWidth: 0,
  },
  '&[data-react-toolbox="button"][disabled]': {
    minWidth: 0,
    color: `${grey[500]} !important`,
    background: 'transparent !important',
  },
})

export const enhance = compose<ActionsPrivateProps, ActionsProps>(
  withRouter,
  withMedia('(max-width: 700px)', {
    name: 'isMobile',
  }),
)

export const ActionsView = ({
  actions,
  isMobile,
  inverse,
  position,
  style,
  history,
}: ActionsPrivateProps) => {
  const icons: Array<Action> = []
  const menuItems: Array<Action> = []
  const auto: Array<Action> = []

  for (let action of actions) {
    if (action.href !== undefined) {
      const onClick = action.onClick
      action = {
        ...action,
        onClick: () => {
          history.push(action.href!)
          if (onClick) {
            onClick!()
          }
        },
      }
    }
    switch (action.placement) {
      case undefined:
      case 'auto':
        auto.push(action)
        break
      case 'toolbar':
        icons.push(action)
        break
      case 'menu':
        menuItems.push(action)
        break
    }
  }

  {
    let action: Action
    while ((action = auto.shift()!) !== undefined) {
      if (
        !isMobile ||
        icons.length < 2 ||
        (auto.length === 1 && icons.length === 2)
      ) {
        icons.push(action)
      } else {
        menuItems.unshift(action)
      }
    }
  }

  return (
    <ActionRow style={style}>
      {icons.map(
        (item, i) =>
          item.icon ? (
            <IconButton
              key={item.label || i}
              inverse={inverse}
              icon={item.icon}
              onClick={item.onClick}
              disabled={item.disabled}
              type={item.type}
              form={item.form}
            />
          ) : (
            <ActionButton
              key={item.label || i}
              inverse={inverse}
              onClick={item.onClick}
              disabled={item.disabled}
              type={item.type}
              form={item.form}
            >
              {item.label}
            </ActionButton>
          ),
      )}
      {menuItems.length > 0 && (
        <IconMenu icon="more_vert" inverse={inverse} position={position}>
          {menuItems.map((item, i) => (
            <MenuItem
              key={item.label || i}
              icon={item.icon}
              caption={item.label || ''}
              onClick={item.onClick}
              disabled={item.disabled}
              type={item.type}
              form={item.form}
            />
          ))}
        </IconMenu>
      )}
    </ActionRow>
  )
}

export const Actions = enhance(ActionsView)
