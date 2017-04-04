import * as React from 'react'
import {AppBar} from 'react-toolbox/lib/app_bar'
// import Button from 'react-toolbox/lib/button/Button'
import {Navigation} from 'react-toolbox/lib/navigation'
import {Column} from 'styled-material/dist/src/layout'
import {ContextAction, ScaffoldContext, Section, scaffoldContextType} from './context'

export type ScaffoldProps = {
  appName: string
}
export type State = {
  sections: Array<Section>
  contextActions?: Array<ContextAction>
}

export class Scaffold extends React.Component<ScaffoldProps, State> {
  static childContextTypes = scaffoldContextType
  context: ScaffoldContext
  state: State = {
    sections: [],
  }

  getChildContext(): ScaffoldContext {
    return {
      pushSection: section => {
        this.setState({
          sections: [section, ...this.state.sections],
        })
      },
      popSection: title => {
        const index = this.state.sections.findIndex(section => section.title === title)
        if (index >= 0) {
          this.setState({
            sections: [...this.state.sections.slice(0, index), ...this.state.sections.slice(index + 1)],
          })
        }
      },
      replaceTitle: (oldTitle, newTitle) => {
        const index = this.state.sections.findIndex(section => section.title === oldTitle)
        if (index >= 0) {
          this.setState({
            sections: [
              ...this.state.sections.slice(0, index),
              {
                ...this.state.sections[index],
                title: newTitle,
              },
              ...this.state.sections.slice(index + 1)
            ],
          })
        }
      },

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
    const {sections, contextActions} = this.state

    return (
      <Column>
        <AppBar
          title={sections[0] ? sections[0].title : appName}
          leftIcon={sections[0] && 'arrow_back'}
          onLeftIconClick={sections[0] && sections[0].onBack}
        >
          {contextActions &&
            <Navigation type="horizontal" actions={contextActions.map(action => ({
              ...action,
              inverse: true,
              style: {margin: 0, minWidth: 0},
            }))} />
          }
        </AppBar>
        {children}
      </Column>
    )
  }
}
