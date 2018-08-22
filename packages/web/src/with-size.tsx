import React from 'react'
import {findDOMNode} from 'react-dom'
import {ComponentEnhancer, wrapDisplayName} from 'recompose'
import ResizeObserverLite from 'resize-observer-lite'

export type Size = {width: number; height: number}
export type SizeProps = {size: Size; ref: (element?: Element) => void}
export const defaultMapSizeToProps = (
  size: Size | undefined,
  ref: (element?: Element) => void,
): {size: Size; ref: (element?: Element) => void} => ({
  size: size || {width: 0, height: 0},
  ref,
})

export function withSize<
  TOutter,
  TSize = {size: Size; ref: (element?: Element) => void}
>({
  mapSizeToProps = defaultMapSizeToProps as any,
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
          this.observer.observe(findDOMNode(element)! as Element)
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
