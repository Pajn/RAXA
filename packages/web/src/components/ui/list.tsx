import * as React from 'react'
import {CSSProperties} from 'react'
import {withMedia} from 'react-with-media'
import {compose} from 'recompose'
import {materialColors} from 'styled-material/dist/src/colors'
import {Column} from 'styled-material/dist/src/layout'
import styled from 'styled-components'

const Container: React.ComponentClass<any> = styled<any>(Column)`
  > div {
    height: ${({isMobile}) => isMobile ? 48 : 20}px;

    &:active {
      background-color: ${materialColors['grey-100']};
    }
  }
`

export const ListItem = ({style, children}: {style?: CSSProperties, children?}) =>
  <Column vertical='center' style={style}>
    {children}
  </Column>

export type ListProps = {
  width?: number
}
export type PrivateListProps = ListProps & {
  isMobile: true
  children: any
}

export const enhance = compose(
  withMedia('(max-width: 700px)', {name: 'isMobile'})
)

export const ListView = ({isMobile, width = 250, children}: PrivateListProps) =>
  <Container isMobile={isMobile} style={isMobile ? {} : {width}}>
    {children}
  </Container>

export const List: React.ComponentClass<ListProps> = enhance(ListView)
