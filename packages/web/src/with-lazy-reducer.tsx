import PropTypes from 'prop-types'
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

export type StorageConfiguration<TState, TAction, TOuterProps = any> = {
  id: string
  initialState: TState | ((props: TOuterProps) => TState)
  reducer: reducer<TState, TAction>
}
type MapStateToProps<TState, TOuterProps, TInnerStateProps> =
  | ((state: TState, props: TOuterProps) => TInnerStateProps)
  | string
  | undefined
type MapDispatchToProps<TAction, TOuterProps, TInnerDispatchProps> =
  | ((
      dispatch: (action: TAction) => void,
      props: TOuterProps,
    ) => TInnerDispatchProps)
  | string
  | undefined
type StateListener<TState> = (getState: () => TState) => void

export type StateContext<TState, TAction> = {
  [id: string]: {
    getState: () => TState
    dispatch: (action: TAction) => void
    register: (listener: StateListener<TState>) => () => void
  }
}

export const stateContext: (
  id: string,
) => {[K in keyof StateContext<any, any>]: PropTypes.Validator<any>} = id => ({
  [id]: PropTypes.shape({
    getState: PropTypes.func,
    dispatch: PropTypes.func,
  }),
})

abstract class StateComponent<P, S> extends React.Component<P, S> {
  mapStateToPropsNeedsProps: boolean
  mapDispatchToPropsNeedsProps: boolean
  mapStateToProps: (state: any, props?: any) => any
  mapDispatchToProps: (state: any, props?: any) => void

  stateProps: any
  dispatchProps: any
  mergedProps: any
  componentShouldUpdate: boolean = true

  abstract getState: () => any
  abstract dispatch: (action: any) => void

  constructor(
    private WrappedComponent: React.ComponentType<any>,
    mapStateToProps: MapStateToProps<any, any, any>,
    mapDispatchToProps: MapDispatchToProps<any, any, any>,
  ) {
    super()

    if (typeof mapStateToProps === 'function') {
      this.mapStateToProps = mapStateToProps
    } else if (mapStateToProps) {
      this.mapStateToProps = state => ({[mapStateToProps]: state})
    } else {
      this.mapStateToProps = () => ({})
    }
    if (typeof mapDispatchToProps === 'function') {
      this.mapDispatchToProps = mapDispatchToProps
    } else if (mapDispatchToProps) {
      this.mapDispatchToProps = dispatch => ({
        [mapDispatchToProps]: dispatch,
      })
    } else {
      this.mapDispatchToProps = () => ({})
    }
    this.mapStateToPropsNeedsProps = this.mapStateToProps.length === 2
    this.mapDispatchToPropsNeedsProps = this.mapDispatchToProps.length === 2
  }

  componentWillMount() {
    this.stateDidUpdate()
  }
  componentWillReceiveProps(nextProps: Readonly<P>) {
    if (this.mapStateToPropsNeedsProps) {
      this.stateProps = this.mapStateToProps(this.getState(), nextProps)
      this.componentShouldUpdate = true
    }
    if (this.mapDispatchToPropsNeedsProps) {
      this.dispatchProps = this.mapDispatchToProps(this.dispatch, nextProps)
      this.componentShouldUpdate = true
    }
    this.mergedProps = {
      ...nextProps as any,
      ...this.stateProps,
      ...this.dispatchProps,
    }
  }
  // shouldComponentUpdate() {
  //   return this.componentShouldUpdate
  // }
  // componentWillUpdate(nextProps: any) {
  //   this.mergedProps = {...this.stateProps, ...this.dispatchProps, ...nextProps}
  // }
  // componentDidUpdate?(
  //   prevProps: Readonly<P>,
  //   prevState: Readonly<S>,
  //   prevContext: any,
  // ): void
  // componentWillUnmount?(): void

  stateDidUpdate() {
    this.stateProps = this.mapStateToProps(this.getState(), this.props)
    this.dispatchProps = this.mapDispatchToProps(this.dispatch, this.props)
    this.mergedProps = {
      ...this.props as any,
      ...this.stateProps,
      ...this.dispatchProps,
    }
    this.setState({})
  }

  render() {
    return <this.WrappedComponent {...this.mergedProps} />
  }
}

export function provideState<TState, TAction, TInnerProps>(
  configuration: StorageConfiguration<TState, TAction>,
  mapStateToProps?: MapStateToProps<TState, any, Partial<TInnerProps>>,
  mapDispatchToProps?: MapDispatchToProps<TAction, any, Partial<TInnerProps>>,
): ComponentEnhancer<any, any>
export function provideState<
  TState,
  TAction,
  TOuterProps,
  TInnerStateProps,
  TInnerDispatchProps
>(
  configuration: StorageConfiguration<TState, TAction>,
  mapStateToProps?: MapStateToProps<TState, TOuterProps, TInnerStateProps>,
  mapDispatchToProps?: MapDispatchToProps<
    TAction,
    TOuterProps,
    TInnerDispatchProps
  >,
): ComponentEnhancer<
  TOuterProps & TInnerStateProps & TInnerDispatchProps,
  TOuterProps
>
export function provideState<TState, TAction, TOuterProps = Readonly<{}>>(
  configuration: StorageConfiguration<TState, TAction, TOuterProps>,
  mapStateToProps,
  mapDispatchToProps,
): ComponentEnhancer<any, TOuterProps> {
  return WrappedComponent =>
    class extends StateComponent<TOuterProps, {state: TState}> {
      static displayName = wrapDisplayName(WrappedComponent, 'provideState')
      static childContextTypes = stateContext(configuration.id)
      listeners = new Set<StateListener<TState>>()

      getState = () => this.state.state

      state = {
        state: typeof configuration.initialState === 'function'
          ? configuration.initialState(this.props)
          : configuration.initialState,
      }
      dispatch = action => {
        const state = configuration.reducer(this.state.state, action)
        if (state !== this.state.state) {
          this.state.state = state
          this.stateDidUpdate()
          this.listeners.forEach(listener => listener(this.getState))
        }
      }

      register = (listener: StateListener<TState>) => {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
      }

      constructor() {
        super(WrappedComponent, mapStateToProps, mapDispatchToProps)
      }

      getChildContext(): StateContext<TState, TAction> {
        return {
          [configuration.id]: {
            getState: this.getState,
            dispatch: this.dispatch,
            register: this.register,
          },
        }
      }
    }
}

export function connectState<
  TState,
  TAction,
  TOuterProps = {},
  TInnerStateProps = {},
  TInnerDispatchProps = {}
>(
  configuration: StorageConfiguration<TState, TAction>,
  mapStateToProps?: MapStateToProps<TState, TOuterProps, TInnerStateProps>,
  mapDispatchToProps?: MapDispatchToProps<
    TAction,
    TOuterProps,
    TInnerDispatchProps
  >,
): ComponentEnhancer<
  TOuterProps & TInnerStateProps & TInnerDispatchProps,
  TOuterProps
>
export function connectState<TState, TAction, TOuterProps = Readonly<{}>>(
  configuration: StorageConfiguration<TState, TAction, TOuterProps>,
  mapStateToProps,
  mapDispatchToProps,
): ComponentEnhancer<any, TOuterProps> {
  return WrappedComponent =>
    class extends StateComponent<TOuterProps, {}> {
      static displayName = wrapDisplayName(WrappedComponent, 'connectState')
      static contextTypes = stateContext(configuration.id)
      context: StateContext<TState, TAction>

      getState = () => this.context[configuration.id].getState()
      dispatch = (action: TAction) =>
        this.context[configuration.id].dispatch(action)

      listener: StateListener<TState> = () => {
        this.stateDidUpdate()
      }

      disposeListener: () => void

      constructor() {
        super(WrappedComponent, mapStateToProps, mapDispatchToProps)
      }

      componentDidMount() {
        if (super.componentDidMount !== undefined) super.componentDidMount()
        this.disposeListener = this.context[configuration.id].register(
          this.listener,
        )
      }

      componentWillUnmount() {
        this.disposeListener()
      }
    }
}
