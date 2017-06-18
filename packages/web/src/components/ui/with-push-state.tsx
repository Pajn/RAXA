import React from 'react'
import {wrapDisplayName} from 'recompose'

export type State<T> = {
  data: T
  title: string
  url?: string
}

export type InjectedPushStateProps<T> = {
  pushState: (state: State<T>) => void
  replaceState: (state: State<T>) => void
  popState: () => void
  state?: State<T>
}

export const withPushState = () => WrappedComponent =>
  class extends React.Component<any, {state?: State<any>}> {
    static displayName = wrapDisplayName(WrappedComponent, 'withPushState')

    state = {state: undefined}

    pushState = (state: State<any>) => {
      history.pushState({state, type: 'withPushState'}, state.title, state.url)
      this.setState({state})
    }
    replaceState_ = (state: State<any>) => {
      history.replaceState(
        {state, type: 'withPushState'},
        state.title,
        state.url,
      )
      this.setState({state})
    }
    popState = () => {
      history.back()
      this.setState({state: undefined})
    }
    onPopState = (e: PopStateEvent) => {
      console.log('onPopState', e.state)
      if (e.state && e.state.type === 'withPushState') {
        this.setState({state: e.state.state})
      } else {
        this.setState({state: undefined})
      }
    }

    componentDidMount() {
      window.addEventListener('popstate', this.onPopState, true)
    }

    componentWillUnmount() {
      window.removeEventListener('popstate', this.onPopState, true)
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          pushState={this.pushState}
          replaceState={this.replaceState_}
          popState={this.popState}
          state={this.state.state}
        />
      )
    }
  }
