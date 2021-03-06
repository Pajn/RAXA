import MUIList from '@material-ui/core/List'
import MUIListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import {isClick} from 'filter-key'
import React from 'react'
import styled from 'react-emotion'
import {compose} from 'recompose'
import {column, row} from 'style-definitions'
import {Theme} from '../../theme'
import {IsTouchProps, withIsTouch} from './mediaQueries'

const DesktopList = styled('div')({
  ...column({}),
  padding: 8,
})

const DesktopListItem = styled('div')<
  {
    isMobile?: boolean
    selected?: boolean
  },
  Theme
>(({isMobile, selected, theme}) => ({
  ...row({}),
  flexShrink: 0,
  boxSizing: 'border-box',
  padding: '8px 4px',
  height: isMobile ? 48 : 32,
  outline: 'none',

  ...(selected
    ? {backgroundColor: theme.background.somewhatLight}
    : {
        // TODO: Report bug to styled-jss,
        // backgroundColor should not be required here
        backgroundColor: 'transparent',
        ':hover': {backgroundColor: theme.background.light},
        ':focus': {backgroundColor: theme.background.light},
      }),
}))

const Container = ({
  isMobile,
  style,
  children,
}: {
  isMobile: boolean
  style?: React.CSSProperties
  children?
}) =>
  isMobile ? (
    <MUIList style={{...style, width: '100%'}}>{children}</MUIList>
  ) : (
    <DesktopList style={style}>{children}</DesktopList>
  )

export type ListItemProps = {
  caption: string
  legend?: string
  onClick?: (e: React.MouseEvent<any> | React.KeyboardEvent<any>) => void
  style?: React.CSSProperties
  isTouch?: boolean
  selected?: boolean
  selectable?: boolean
  button?: boolean
}

export const ListItem = ({
  caption,
  legend,
  isTouch,
  selectable,
  ...props
}: ListItemProps) =>
  isTouch ? (
    <MUIListItem {...props}>
      <ListItemText primary={caption} secondary={legend} />
    </MUIListItem>
  ) : (
    <DesktopListItem
      {...props}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyPress={
        selectable && props.onClick
          ? isClick(props.onClick as React.KeyboardEventHandler<any>)
          : undefined
      }
    >
      <div>{caption}</div>
      {legend && <div>{legend}</div>}
    </DesktopListItem>
  )

export type ListProps = {
  width?: number
  selectable?: boolean
}
export type PrivateListProps = ListProps &
  IsTouchProps & {
    children: any
  }

export const enhance = compose(withIsTouch)

export const ListView = ({
  isTouch,
  width = 250,
  selectable,
  children,
}: PrivateListProps) => (
  <Container isMobile={isTouch} style={isTouch ? {} : {width}}>
    {React.Children.map(children, child => {
      if (!child) return child
      const c = child as React.ReactElement<any>
      if (c.type === ListItem) {
        return React.cloneElement(c, {
          isTouch,
          selectable:
            c.props.selectable === undefined ? selectable : c.props.selectable,
        })
      }
      return child
    })}
  </Container>
)

export const List: React.ComponentClass<ListProps> = enhance(ListView)
