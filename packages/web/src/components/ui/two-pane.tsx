import * as React from 'react'
import compose from 'recompose/compose'
import {Row} from 'styled-material/dist/src/layout'
import {IsMobileProps, withIsMobile} from './mediaQueries'
import {Section} from './scaffold/section'

export type TwoPaneProps = {
  open?: {title: string}
  onBack: () => void
}
export type PrivateTwoPaneProps = TwoPaneProps & IsMobileProps & {
  children: any
}

export const enhance = compose(
  withIsMobile,
)

export const TwoPaneView = ({open, onBack, isMobile, children}: PrivateTwoPaneProps) =>
  <Row>
    {isMobile
      ? (open
          ? <Section title={open.title} onBack={onBack}>
              {children[1]}
            </Section>
          : children[0]
        )
      : children}
  </Row>

export const TwoPane = enhance(TwoPaneView) as React.ComponentClass<TwoPaneProps>
