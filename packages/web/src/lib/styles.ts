import {keyframes} from 'glamor'
import {CSSProperties} from 'glamorous'
import {animationCurve, animationDuration} from 'material-definitions'

export const fadeInAnimation = keyframes({
  '0%': {
    opacity: 0,
  },
  '100%': {
    opacity: 1,
  },
})

export const fadeIn = (
  {
    duration = animationDuration.mobile.enter,
    easing = animationCurve.deceleration,
    delay = 0,
  }: {duration?: number; easing?: string; delay?: number} = {},
): CSSProperties => ({
  animation: `${fadeInAnimation} ${duration}ms ${delay}ms ${easing}`,
})
