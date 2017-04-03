import * as React from 'react'
import {CSSProperties} from 'react'
import {List as ToolboxList, ListItem as ToolboxListItem} from 'react-toolbox/lib/list'
import {withMedia} from 'react-with-media'
import {compose} from 'recompose'
import {materialColors} from 'styled-material/dist/src/colors'
import {Column} from 'styled-material/dist/src/layout'
import styled from 'styled-components'

const DesktopList: React.ComponentClass<any> = styled<any>(Column)`
`

const DesktopListItem: React.ComponentClass<any> = styled<any>(Column)`
  height: ${({isMobile}) => isMobile ? 48 : 20}px;

  ${({selected}) => selected && `background-color: ${materialColors['grey-100']};`}

  &:active {
    background-color: ${materialColors['grey-100']};
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
  isMobile?: boolean
  selected?: boolean
  selectable?: boolean
}

export const ListItem = ({caption, legend, isMobile, ...props}: ListItemProps) =>
  isMobile
    ? <ToolboxListItem
        {...props}
        caption={caption}
        legend={legend}
      />
    : <DesktopListItem {...props}>
        <div>{caption}</div>
        {legend && <div>{legend}</div>}
      </DesktopListItem>

export type ListProps = {
  width?: number
  selectable?: boolean
}
export type PrivateListProps = ListProps & {
  isMobile: true
  children: any
}

export const enhance = compose(
  withMedia('(max-width: 700px)', {name: 'isMobile'})
)

export const ListView = ({isMobile, width = 250, selectable, children}: PrivateListProps) =>
  <Container isMobile={isMobile} style={isMobile ? {} : {width}}>
    {React.Children.map(children, child => {
      if (!child) return child
      const c = child as React.ReactElement<any>
      if (c.type === ListItem) {
        return React.cloneElement(c, {
          isMobile,
          selectable: c.props.selectable === undefined
            ? selectable
            : c.props.selectable
        })
      }
      return child
    })}
  </Container>

export const List: React.ComponentClass<ListProps> = enhance(ListView)
