import glamorous from 'glamorous'
import {History, Location} from 'history'
import React from 'react'
import {withRouter} from 'react-router'
import AppBar from 'react-toolbox/lib/app_bar/AppBar'
import {compose} from 'recompose'
import {column} from 'style-definitions'
import {Actions} from '../actions'
import {
  ContextAction,
  ScaffoldContext,
  Section,
  scaffoldContextType,
} from './context'

const Container = glamorous.div(column({flex: 1}))
const SolidAppBar = glamorous(AppBar)({flexShrink: 0})

export type ScaffoldProps = {
  appName: string
}
export type PrivateScaffoldProps = ScaffoldProps & {
  location: Location
  history: History
}
export type State = {
  sections: Array<Section>
  contextActions?: Array<ContextAction>
}

const enhance = compose(withRouter)

export class ScaffoldView extends React.Component<PrivateScaffoldProps, State> {
  static childContextTypes = scaffoldContextType
  context: ScaffoldContext
  state: State = {
    sections: [],
  }

  get activeSection() {
    return this.state.sections[0]
  }

  get currentUrl() {
    return this.activeSection && this.activeSection.path
  }

  back = () => this.props.history.goBack()

  pushSection = (section: Section) => {
    // Set state synchronously to not drop multiple changes in the same render
    this.state.sections = [section, ...this.state.sections]
    this.setState({})
  }
  popSection = (title?: string) => {
    const index = title
      ? this.state.sections.findIndex(section => section.title === title)
      : 0
    if (index >= 0) {
      // Set state synchronously to not drop multiple changes in the same render
      this.state.sections = [
        ...(index > 0 ? this.state.sections.slice(0, index) : []),
        ...this.state.sections.slice(index + 1),
      ]
      this.setState({})
    }
  }
  replaceSection = (newSection: Section, oldTitle?: string) => {
    const index = oldTitle
      ? this.state.sections.findIndex(section => section.title === oldTitle)
      : 0

    if (index >= 0) {
      this.setState({
        sections: [
          ...this.state.sections.slice(0, index),
          newSection,
          ...this.state.sections.slice(index + 1),
        ],
      })
    }
  }

  getChildContext(): ScaffoldContext {
    return {
      activeSection: this.activeSection,

      pushSection: this.pushSection,
      popSection: this.popSection,
      replaceSection: this.replaceSection,

      setContextActions: contextActions => {
        this.setState({contextActions})
      },
      clearContextActions: () => {
        if (this.state.contextActions)
          this.setState({contextActions: undefined})
      },
    }
  }

  render() {
    const {appName, children} = this.props
    const {contextActions} = this.state
    const activeSection = this.activeSection

    return (
      <Container>
        <SolidAppBar
          title={activeSection ? activeSection.title : appName}
          leftIcon={activeSection && 'arrow_back'}
          onLeftIconClick={
            activeSection && activeSection.onBack
              ? () => activeSection.onBack!(this.props.history)
              : undefined
          }
        >
          {contextActions && (
            <Actions
              actions={contextActions}
              inverse
              style={{marginRight: -8}}
            />
          )}
        </SolidAppBar>
        {children}
      </Container>
    )
  }
}

export const Scaffold = enhance(ScaffoldView) as React.ComponentClass<
  ScaffoldProps
>
