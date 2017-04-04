import {withMedia} from 'react-with-media'

export type IsMobileProps = {
  isMobile: boolean
}

export const withIsMobile = withMedia('(max-width: 700px)', {name: 'isMobile'})

export type IsTouchProps = {
  isTouch: boolean
}

export const withIsTouch = withMedia('(max-width: 700px)', {name: 'isTouch'})
