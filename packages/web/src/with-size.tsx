import React from 'react'
import {findDOMNode} from 'react-dom'
import {ComponentEnhancer, wrapDisplayName} from 'recompose'
import ResizeObserverLite from 'resize-observer-lite'

export type Size = {width: number; height: number}
export const defaultMapSizeToProps = (
  size: Size | undefined,
  ref: (element?: Element) => void,
): {size?: Size; ref: (element?: Element) => void} => ({size, ref})

export function withSize<
  TOutter,
  TSize = {size: Size; ref: (element?: Element) => void}
>({
  mapSizeToProps = defaultMapSizeToProps,
}: {
  mapSizeToProps?: (
    size: Size | undefined,
    ref: (element?: Element) => void,
  ) => TSize
} = {}): ComponentEnhancer<TSize & TOutter, TOutter> {
  return WrappedComponent =>
    class extends React.Component<TOutter, {sizeProps: TSize}> {
      static displayName = wrapDisplayName(WrappedComponent, 'withSize')
      observer = new ResizeObserverLite(size => {
        this.setState({sizeProps: mapSizeToProps(size, this.ref) as TSize})
      })

      ref = (element?: Element) => {
        if (element) {
          this.observer.observe(findDOMNode(element))
        } else {
          this.observer.disconnect()
        }
      }

      constructor(props) {
        super(props)
        this.state = {sizeProps: mapSizeToProps(undefined, this.ref) as TSize}
      }

      render() {
        return <WrappedComponent {...this.props} {...this.state.sizeProps} />
      }
    } as any
}
