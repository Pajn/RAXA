import Flexbox from 'flexbox-react'
import * as React from 'react'
import compose from 'recompose/compose'
import {IsMobileProps, withIsMobile} from './mediaQueries'
import {Section as SectionType} from './scaffold/context'
import {Section} from './scaffold/section'

export type TwoPaneProps = {
  open?: SectionType
}
export type PrivateTwoPaneProps = TwoPaneProps & IsMobileProps & {
  children: any
}

export const enhance = compose(
  withIsMobile,
)

export const TwoPaneView = ({open, isMobile, children}: PrivateTwoPaneProps) =>
  <Flexbox>
    {isMobile
      ? (open
          ? <Section {...open}>
              {children[1]}
            </Section>
          : children[0]
        )
      : children}
  </Flexbox>

export const TwoPane = enhance(TwoPaneView) as React.ComponentClass<TwoPaneProps>
