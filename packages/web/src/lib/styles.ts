import {keyframes} from 'glamor'
import {CSSProperties} from 'glamorous'

/**
 * The standard curve (also referred to as “ease in out”) is the most common
 * easing curve. Elements quickly accelerate and slowly decelerate between
 * on-screen locations.
 * It applies to growing and shrinking material, among other property changes.
 */
export const standardCurve = 'cubic-bezier(0.4, 0.0, 0.2, 1)'
/**
 * Using the deceleration curve (also referred to as “ease out”) elements
 * enter the screen at full velocity and slowly decelerate to a resting point.
 *
 * During deceleration, elements may scale up either in size (to 100%) or
 * opacity (to 100%). In some cases, when elements enter the screen at 0% opacity,
 * they may slightly shrink from a larger size upon entry.
 */
export const decelerationCurve = 'cubic-bezier(0.0, 0.0, 0.2, 1)'
/**
 * Using the acceleration curve (also referred to as “ease in”) elements
 * leave the screen at full velocity. They do not decelerate when off-screen.
 *
 * They accelerate at the beginning of the animation and may scale down
 * in either size (to 0%) or opacity (to 0%). In some cases, when elements
 * leave the screen at 0% opacity, they may also slightly scale up or down in size.
 */
export const accelerationCurve = 'cubic-bezier(0.4, 0.0, 1, 1)'
/**
 * Using the sharp curve (also referred to as “ease in out”) elements quickly
 * accelerate and decelerate. It is used by exiting elements that may return
 * to the screen at any time.
 *
 * Elements may quickly accelerate from a starting point on-screen, then
 * quickly decelerate in a symmetrical curve to a resting point immediately
 * off-screen. The deceleration is faster than the standard curve since it
 * doesn't follow an exact path to the off-screen point.
 * Elements may return from that point at any time.
 */
export const sharpCurve = 'cubic-bezier(0.4, 0.0, 0.6, 1)'

export const animationDuration = {
  mobile: {
    large: 375,
    enter: 225,
    leave: 195,
  },
  tablet: {
    large: 375 * 1.3,
    enter: 225 * 1.3,
    leave: 195 * 1.3,
  },
  desktop: {
    large: 375 * 0.7,
    enter: 225 * 0.7,
    leave: 195 * 0.7,
  },
}

export const animationPreset = {
  move: {delay: animationDuration.mobile.enter, easing: standardCurve},
  enter: {delay: animationDuration.mobile.enter, easing: decelerationCurve},
  leave: {delay: animationDuration.mobile.leave, easing: accelerationCurve},
}

export const flex = (
  flex: number | boolean | {grow?: number; shrink?: number},
): CSSProperties => ({
  flexGrow: flex === true
    ? 1
    : flex === false
      ? undefined
      : flex === undefined
        ? undefined
        : typeof flex === 'number' ? flex : flex.grow,
  flexShrink: flex === true
    ? undefined
    : flex === false
      ? undefined
      : flex === undefined
        ? undefined
        : typeof flex === 'number' ? flex : flex.grow,
})

export const column = ({
  horizontal,
  vertical,
  self,
  reverse,
  flex: flex_,
}: {
  horizontal?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline'
  vertical?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
  self?: 'center' | 'flex-start' | 'flex-end' | 'stretch'
  reverse?: boolean
  flex?: number | boolean | {grow?: number; shrink?: number}
}): CSSProperties => ({
  display: 'flex',
  flexDirection: reverse ? 'column' : 'column-reverse',
  alignItems: horizontal,
  justifyContent: vertical,
  self,
  ...flex_ === undefined ? undefined : flex(flex_),
})

export const row = ({
  horizontal,
  vertical,
  self,
  reverse,
  flex: flex_,
}: {
  horizontal?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
  vertical?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline'
  self?: 'center' | 'flex-start' | 'flex-end' | 'stretch'
  reverse?: boolean
  flex?: number | boolean | {grow?: number; shrink?: number}
}): CSSProperties => ({
  display: 'flex',
  flexDirection: reverse ? 'row' : 'row-reverse',
  alignItems: vertical,
  justifyContent: horizontal,
  self,
  ...flex_ === undefined ? undefined : flex(flex_),
})

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
    easing = decelerationCurve,
    delay = 0,
  }: {duration?: number; easing?: string; delay?: number} = {},
): CSSProperties => ({
  animation: `${fadeInAnimation} ${duration}ms ${delay}ms ${easing}`,
})
