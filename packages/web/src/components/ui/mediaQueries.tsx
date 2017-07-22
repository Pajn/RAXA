import {withMedia} from 'react-with-media'
import {ComponentEnhancer} from 'recompose'

export type IsMobileProps = {
  isMobile: boolean
}

export const withIsMobile: ComponentEnhancer<
  {},
  {isMobile: boolean}
> = withMedia('(max-width: 700px)', {name: 'isMobile'}) as any

export type IsTouchProps = {
  isTouch: boolean
}

export const withIsTouch: ComponentEnhancer<
  {},
  {isTouch: boolean}
> = withMedia('(max-width: 700px)', {name: 'isTouch'}) as any
