import {ThrottleSettings} from 'lodash'
import throttle from 'lodash.throttle'
import React from 'react'
import {wrapDisplayName} from 'recompose'

export function withThrottledMutation<TOuter>(
  timeout: number,
  valueProp: string,
  updateProp: string,
  updater: (value: any, props: TOuter) => any,
  options: {
    settings?: ThrottleSettings
    mapValue?: (value: any, props: TOuter) => any
  } = {},
) {
  const throttledUpdater = throttle(updater, timeout, options.settings)

  return WrappedComponent =>
    class extends React.Component<TOuter, {value: any}> {
      static displayName = wrapDisplayName(
        WrappedComponent,
        'withThrottledMutation',
      )

      state = {value: undefined}
      setValue = value => {
        throttledUpdater(value, this.props)
        if (options.mapValue) {
          value = options.mapValue(value, this.props)
        }
        this.setState({value})
      }

      componentWillMount() {
        this.setState({value: this.props[valueProp]})
      }

      componentWillReceiveProps(props) {
        this.setState({value: props[valueProp]})
      }

      render() {
        return (
          <WrappedComponent
            {...this.props}
            {...{[valueProp]: this.state.value, [updateProp]: this.setValue}}
          />
        )
      }
    }
}
