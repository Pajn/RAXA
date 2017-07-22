import glamorous from 'glamorous'
import React from 'react'
import {compose} from 'recompose'
import {row} from 'style-definitions'
import {IsMobileProps, withIsMobile} from './mediaQueries'
import {Section as SectionType} from './scaffold/context'
import {Section} from './scaffold/section'

const Container = glamorous.div(row({}))

export type TwoPaneProps = {
  open?: SectionType
}
export type PrivateTwoPaneProps = TwoPaneProps &
  IsMobileProps & {
    children: any
  }

export const enhance = compose(withIsMobile)

export const TwoPaneView = ({open, isMobile, children}: PrivateTwoPaneProps) =>
  <Container>
    {isMobile
      ? open
        ? <Section {...open}>
            {children[1]}
          </Section>
        : children[0]
      : children}
  </Container>

export const TwoPane = enhance(TwoPaneView) as React.ComponentClass<
  TwoPaneProps
>
