import React from 'react'
import compose from 'recompose/compose'
import getContext from 'recompose/getContext'
import lifecycle from 'recompose/lifecycle'
import {
  ScaffoldContext,
  Section as SectionType,
  scaffoldContextType,
} from './context'

export type SectionProps = SectionType
export type PrivateSectionProps = SectionProps &
  ScaffoldContext & {
    children: any
  }

export const enhance = compose(
  getContext(scaffoldContextType),
  lifecycle({
    componentDidMount() {
      const {title, onBack, path, pushSection} = this
        .props as PrivateSectionProps
      pushSection({title, onBack, path})
    },
    componentWillReceiveProps(nextProps: PrivateSectionProps) {
      const {title, onBack, path} = nextProps as PrivateSectionProps
      if (title !== this.props.title || path !== this.props.path) {
        nextProps.replaceSection({title, onBack, path}, this.props.title)
      }
    },
    componentWillUnmount() {
      const {title, popSection, onUnload} = this.props as PrivateSectionProps
      popSection(title)
      if (onUnload) {
        onUnload()
      }
    },
  }),
)

export const SectionView = ({children = null}: PrivateSectionProps) => children

export const Section = enhance(SectionView) as React.ComponentClass<
  SectionProps
>
