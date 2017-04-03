import * as React from 'react'
import {withMedia} from 'react-with-media'
import {compose} from 'recompose'

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
  <div>
    {isMobile ? children[open ? 1 : 0] : children}
  </div>

export const TwoPane = enhance(TwoPaneView) as React.ComponentClass<TwoPaneProps>
