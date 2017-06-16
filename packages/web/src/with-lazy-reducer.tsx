import React from 'react'
import {ComponentEnhancer, wrapDisplayName} from 'recompose'

type reducer<TState, TAction> = (s: TState, a: TAction) => TState
export function withLazyReducer<TState, TAction>(
  stateName: string,
  dispatchName: string,
  reducer: reducer<TState, TAction>,
  initialState: TState,
): ComponentEnhancer<any, any>
export function withLazyReducer<TOutter, TState, TAction>(
  stateName: string,
  dispatchName: string,
  reducer: reducer<TState, TAction>,
  initialState: (props: TOutter) => TState,
): ComponentEnhancer<any, TOutter>
export function withLazyReducer(
  stateName,
  dispatchName,
  reducer,
  initialState,
): ComponentEnhancer<any, any> {
  return WrappedComponent =>
    class extends React.Component<{}, {state: any}> {
      static displayName = wrapDisplayName(WrappedComponent, 'withLazyReducer')

      state = {
        state: typeof initialState === 'function'
          ? initialState(this.props)
          : initialState,
      }
      dispatch = action => {
        const state = reducer(this.state.state, action)
        if (state !== this.state.state) {
          this.setState({state})
        }
      }

      render() {
        return (
          <WrappedComponent
            {...this.props}
            {...{[stateName]: this.state.state, [dispatchName]: this.dispatch}}
          />
        )
      }
    }
}
