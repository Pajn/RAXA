import * as React from 'react'
import setDisplayName from 'recompose/setDisplayName'
import wrapDisplayName from 'recompose/wrapDisplayName'

export type State<T> = {
  data: T
  title: string
  url?: string
}

export type WithPushStateProps<T> = {
  pushState: (state: State<T>) => void,
  state?: T
}

export const withPushState = ({onBack}: {onBack: (ownProps: any) => void}) => WrappedComponent =>
  setDisplayName(wrapDisplayName(WrappedComponent, 'withPushState'))(
    class extends React.Component<any, {state: Array<State<any>>}> {
      state = {state: [] as Array<State<any>>}
      isActiveState = false

      pushState = (state: State<any>) => {
        console.log('pushState', state)
        this.isActiveState = true
        this.state.state.unshift(state)
        history.pushState(state.data, state.title, state.url)
      }
      onPushState = (e: PopStateEvent) => this.checkActiveState(e)
      onPopState = (e: PopStateEvent) => {
        if (this.isActiveState) {
          e.preventDefault()
          e.stopImmediatePropagation()
          this.state.state.shift()
          onBack(this.props)
        }
        this.checkActiveState(e)
      }

      private checkActiveState(e: PopStateEvent) {
        const activeState = this.state.state[0]
        this.isActiveState =
          activeState && e.state &&
          e.state.title === activeState.title &&
          e.state.data === activeState.data &&
          e.state.url === activeState.url
      }

      componentDidMount() {
        window.addEventListener('pushstate', this.onPushState, true)
        window.addEventListener('popstate', this.onPopState, true)
      }

      componentWillUnmount() {
        window.removeEventListener('pushstate', this.onPushState, true)
        window.removeEventListener('popstate', this.onPopState, true)
      }

      render() {
        return <WrappedComponent {...this.props} pushState={this.pushState} />
      }
    }
  )
