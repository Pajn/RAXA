import {animationCurve, animationDuration} from 'material-definitions'
import {CSSProperties} from 'react'
import {fadeInAnimation} from './animations.module.css'

export const fadeIn = ({
  duration = animationDuration.mobile.enter,
  easing = animationCurve.deceleration,
  delay = 0,
}: {
  duration?: number
  easing?: string
  delay?: number
} = {}): CSSProperties => ({
  animation: `${fadeInAnimation} ${duration}ms ${delay}ms ${easing}`,
})
