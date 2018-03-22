import React from 'react'
import {ComponentEnhancer, wrapDisplayName} from 'recompose'

export type InjectedIdProps = {
  ids: Array<string>
  replace: (id: string, newValue: any) => void
}

export function withIds<TOuter>(
  prop: string,
): ComponentEnhancer<TOuter & InjectedIdProps, TOuter> {
  let nextId = 0
  return WrappedComponent =>
    class extends React.Component<TOuter, {}> {
      static displayName = wrapDisplayName(WrappedComponent, 'withIds')

      map = new WeakMap()

      replace = (id, newValue) => {
        this.map.set(newValue, id)
      }

      render() {
        const values = this.props[prop] || []
        const ids = values.map(value => {
          if (this.map.has(value)) {
            return this.map.get(value)
          } else {
            const id = ++nextId
            this.map.set(value, id)
            return id
          }
        })

        return (
          <WrappedComponent {...this.props} ids={ids} replace={this.replace} />
        )
      }
    }
}
