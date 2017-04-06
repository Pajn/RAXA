import {isClick} from 'filter-key'
import Flexbox from 'flexbox-react'
import * as React from 'react'
import {CSSProperties} from 'react'
import {List as ToolboxList, ListItem as ToolboxListItem} from 'react-toolbox/lib/list'
import compose from 'recompose/compose'
import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'
import {IsTouchProps, withIsTouch} from './mediaQueries'

const DesktopList: React.ComponentClass<any> = styled<any>(Flexbox)`
  flex-direction: column;
  padding: 8px;
`

const DesktopListItem: React.ComponentClass<any> = styled<any>(Flexbox)`
  box-sizing: border-box;
  padding: 8px 4px;
  height: ${({isMobile}) => isMobile ? 48 : 32}px;
  outline: none;

  ${({selected}) => selected
    ? `background-color: ${materialColors['grey-200']};`
    : `
      &:hover,
      &:focus {
        background-color: ${materialColors['grey-100']};
      }
    `
  }
`

const Container = ({isMobile, style, children}: {isMobile: boolean, style?: CSSProperties, children?}) =>
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

export const ListItem = ({caption, legend, isTouch, selectable, ...props}: ListItemProps) =>
  isTouch
    ? <ToolboxListItem
        {...props}
        caption={caption}
        legend={legend}
      />
    : <DesktopListItem {...props}
        role={selectable && 'button'}
        tabIndex={selectable && 0}
        onKeyPress={selectable && props.onClick && isClick(props.onClick)}
      >
        <div>{caption}</div>
        {legend && <div>{legend}</div>}
      </DesktopListItem>

export type ListProps = {
  width?: number
  selectable?: boolean
}
export type PrivateListProps = ListProps & IsTouchProps & {
  children: any
}

export const enhance = compose(
  withIsTouch,
)

export const ListView = ({isTouch, width = 250, selectable, children}: PrivateListProps) =>
  <Container isMobile={isTouch} style={isTouch ? {} : {width}}>
    {React.Children.map(children, child => {
      if (!child) return child
      const c = child as React.ReactElement<any>
      if (c.type === ListItem) {
        return React.cloneElement(c, {
          isTouch,
          selectable: c.props.selectable === undefined
            ? selectable
            : c.props.selectable
        })
      }
      return child
    })}
  </Container>

export const List: React.ComponentClass<ListProps> = enhance(ListView)
