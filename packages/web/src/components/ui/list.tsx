import {isClick} from 'filter-key'
import glamorous, {CSSProperties} from 'glamorous'
import {grey} from 'material-definitions'
import React from 'react'
import {
  List as ToolboxList,
  ListItem as ToolboxListItem,
} from 'react-toolbox/lib/list'
import {compose} from 'recompose'
import {column, row} from 'style-definitions'
import {IsTouchProps, withIsTouch} from './mediaQueries'

const DesktopList = glamorous.div({
  ...column({}),
  padding: 8,
})

const DesktopListItem = glamorous.div(
  ({isMobile, selected}: {isMobile?: boolean; selected?: boolean}) => ({
    ...row({}),
    boxSizing: 'border-box',
    padding: '8px 4px',
    height: isMobile ? 48 : 32,
    outline: 'none',

    ...selected
      ? {backgroundColor: grey[200]}
      : {
          ':hover': {backgroundColor: grey[100]},
          ':focus': {backgroundColor: grey[100]},
        } as CSSProperties,
  }),
)

const Container = ({
  isMobile,
  style,
  children,
}: {
  isMobile: boolean
  style?: CSSProperties
  children?
}) =>
  isMobile
    ? <ToolboxList style={style}>
        {children}
      </ToolboxList>
    : <DesktopList style={style}>
        {children}
      </DesktopList>

export type ListItemProps = {
  caption: string
  legend?: string
  onClick?: (e: React.MouseEvent<any>) => void
  style?: CSSProperties
  isTouch?: boolean
  selected?: boolean
  selectable?: boolean
}

export const ListItem = ({
  caption,
  legend,
  isTouch,
  selectable,
  ...props,
}: ListItemProps) =>
  isTouch
    ? <ToolboxListItem {...props} caption={caption} legend={legend} />
    : <DesktopListItem
        {...props}
        role={selectable ? 'button' : undefined}
        tabIndex={selectable ? 0 : undefined}
        onKeyPress={selectable && props.onClick && isClick(props.onClick)}
      >
        <div>{caption}</div>
        {legend && <div>{legend}</div>}
      </DesktopListItem>

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
}: PrivateListProps) =>
  <Container isMobile={isTouch} style={isTouch ? {} : {width}}>
    {React.Children.map(children, child => {
      if (!child) return child
      const c = child as React.ReactElement<any>
      if (c.type === ListItem) {
        return React.cloneElement(c, {
          isTouch,
          selectable: c.props.selectable === undefined
            ? selectable
            : c.props.selectable,
        })
      }
      return child
    })}
  </Container>

export const List: React.ComponentClass<ListProps> = enhance(ListView)
