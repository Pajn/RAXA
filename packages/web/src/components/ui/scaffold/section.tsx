import {compose, getContext, lifecycle} from 'recompose'
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

export const enhance = compose<PrivateSectionProps, SectionProps>(
  getContext(scaffoldContextType),
  lifecycle<PrivateSectionProps, PrivateSectionProps>({
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

export const Section = enhance(SectionView)
