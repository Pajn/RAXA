import Flexbox from 'flexbox-react'
import {History, Location} from 'history'
import {grey} from 'material-definitions'
import React from 'react'
import {withRouter} from 'react-router'
import AppBar from 'react-toolbox/lib/app_bar/AppBar'
import {ButtonProps} from 'react-toolbox/lib/button/Button'
import Navigation from 'react-toolbox/lib/navigation/Navigation'
import compose from 'recompose/compose'
import {
  ContextAction,
  ScaffoldContext,
  Section,
  scaffoldContextType,
} from './context'

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
    // if (section.path) {
    //   this.props.history.push(section.path)
    // }
    this.setState({
      sections: [section, ...this.state.sections],
    })
  }
  popSection = (title?: string) => {
    const index = title
      ? this.state.sections.findIndex(section => section.title === title)
      : 0
    // if (back && index === 0 && this.state.sections[0].path) {
    //   this.props.history.goBack()
    // }
    if (index >= 0) {
      this.setState({
        sections: [
          ...this.state.sections.slice(0, index),
          ...this.state.sections.slice(index + 1),
        ],
      })
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
        this.setState({contextActions: undefined})
      },
    }
  }

  render() {
    const {appName, children} = this.props
    const {contextActions} = this.state
    const activeSection = this.activeSection

    return (
      <Flexbox flexDirection="column" flex="1">
        <AppBar
          title={activeSection ? activeSection.title : appName}
          leftIcon={activeSection && 'arrow_back'}
          onLeftIconClick={activeSection && activeSection.onBack}
        >
          {contextActions &&
            <Navigation
              type="horizontal"
              actions={contextActions.map<ButtonProps>(action => ({
                ...action,
                inverse: true,
                style: {
                  margin: 0,
                  minWidth: 0,
                  color: action.disabled ? grey[500] : undefined,
                  background: action.disabled ? 'transparent' : undefined,
                },
              }))}
            />}
        </AppBar>
        {children}
      </Flexbox>
    )
  }
}

export const Scaffold = enhance(ScaffoldView) as React.ComponentClass<
  ScaffoldProps
>
