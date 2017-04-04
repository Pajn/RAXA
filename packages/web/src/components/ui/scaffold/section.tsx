import * as React from 'react'
import compose from 'recompose/compose'
import getContext from 'recompose/getContext'
import lifecycle from 'recompose/lifecycle'
import {ScaffoldContext, scaffoldContextType} from './context'

export type SectionProps = {
  title: string
  onBack: () => void
}
export type PrivateSectionProps = SectionProps & ScaffoldContext & {
  children: any
}

export const enhance = compose(
  getContext(scaffoldContextType),
  lifecycle({
    componentDidMount() {
      const {title, onBack, pushSection} = this.props as PrivateSectionProps
      pushSection({title, onBack})
    },
    componentWillReceiveProps(nextProps: PrivateSectionProps) {
      if (nextProps.title !== this.props.title) {
        nextProps.replaceTitle(this.props.title, nextProps.title)
      }
    },
    componentWillUnmount() {
      const {title, popSection} = this.props as PrivateSectionProps
      popSection(title)
    },
  })
)

export const SectionView = ({children}: PrivateSectionProps) => children

export const Section = enhance(SectionView) as React.ComponentClass<SectionProps>
