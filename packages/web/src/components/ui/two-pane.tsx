import * as React from 'react'
import {withMedia} from 'react-with-media'
import {compose} from 'recompose'
import {Row} from 'styled-material/dist/src/layout'

export type TwoPaneProps = {
  open: boolean
}
export type PrivateTwoPaneProps = TwoPaneProps & {
  isMobile: true
  children: any
}

export const enhance = compose(
  withMedia('(max-width: 700px)', {name: 'isMobile'})
)

export const TwoPaneView = ({open, isMobile, children}: PrivateTwoPaneProps) =>
  <Row>
    {isMobile ? children[open ? 1 : 0] : children}
  </Row>

export const TwoPane = enhance(TwoPaneView) as React.ComponentClass<TwoPaneProps>
