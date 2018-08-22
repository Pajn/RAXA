import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Typography from '@material-ui/core/Typography'
import {colorTemperature2rgb, rgb2colorTemperature} from 'color-temperature'
import glamorous from 'glamorous'
import React from 'react'
import {Color, ColorResult, CustomPicker, RGBColor} from 'react-color'
import Hue from 'react-color/lib/components/common/Hue'
import HuePointer from 'react-color/lib/components/hue/HuePointer'
import {compose, withState} from 'recompose'
import {compose as fnCompose} from 'redux'
import {column, row} from 'style-definitions'
import {
  InjectedInputEventsProps,
  InputEventsContainer,
  withInputEvents,
} from '../../with-input-events/with-input-events'
import {ColorButton} from '../dashboard/widgets/ui/light-button'

declare module 'react' {
  interface CSSProperties {
    self?: string
  }
}

const lerp = (a: number, b: number, alpha: number) =>
  a * (1 - alpha) + b * alpha
const lerpRGB = (a: RGBColor, b: RGBColor, alpha: number) => ({
  r: Math.round(lerp(a.r, b.r, alpha)),
  g: Math.round(lerp(a.g, b.g, alpha)),
  b: Math.round(lerp(a.b, b.b, alpha)),
})
const lerpi = (a: number, b: number, value: number) => (value - a) / (b - a)
const inRange = (min: number, max: number, value: number) =>
  value >= min && value <= max
const toShort = ({red, green, blue}): RGBColor => ({r: red, g: green, b: blue})
const toLong = ({r, g, b}: RGBColor) => ({red: r, green: g, blue: b})
const toCSS = (color: RGBColor) => `rgb(${color.r}, ${color.g}, ${color.b})`

const minTemp = 2200
const maxTemp = 4000

const temperaturePresets = {
  relax: {
    color: {r: 235, g: 207, b: 115},
    temp: 2200,
  },
  everyday: {
    color: {r: 250, g: 237, b: 202},
    temp: 2700,
  },
  focus: {
    color: {r: 246, g: 252, b: 252},
    temp: 4000,
  },
}

type ColorSliderProps = ColorResult & {
  radius?: number
  shadow?: string
  pointer?: React.ReactType
  direction?: 'horizontal' | 'vertical'
  onChange: (color: Color) => void
}

type PrivateColorSliderProps = ColorSliderProps & InjectedInputEventsProps

type ColorSliderOptions = {
  minValue: number
  maxValue: number
  valueToColor: (value: number, props: ColorSliderProps) => Color
  valueToCSS: (value: number, props: ColorSliderProps) => string
  colorToValue: (props: ColorSliderProps) => number
}

const CenteredHuePointer = props => (
  <div style={{marginTop: 8}}>
    <HuePointer {...props} />
  </div>
)

const colorSlider = (options: ColorSliderOptions) =>
  withInputEvents(
    class TemperatureSlider extends React.PureComponent<
      PrivateColorSliderProps
    > {
      container: HTMLElement | null
      didBindStartListeners = false

      calculateChange(e, props, container) {
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        const x = typeof e.pageX === 'number' ? e.pageX : e.touches[0].pageX
        const y = typeof e.pageY === 'number' ? e.pageY : e.touches[0].pageY
        const left =
          x - (container.getBoundingClientRect().left + window.pageXOffset)
        const top =
          y - (container.getBoundingClientRect().top + window.pageYOffset)

        let value: number
        if (props.direction === 'vertical') {
          if (top < 0) {
            value = options.minValue
          } else if (top > containerHeight) {
            value = options.maxValue
          } else {
            const percent = top / containerHeight
            value = lerp(options.minValue, options.maxValue, percent)
          }
        } else {
          if (left < 0) {
            value = options.minValue
          } else if (left > containerWidth) {
            value = options.maxValue
          } else {
            const percent = left / containerWidth
            value = lerp(options.minValue, options.maxValue, percent)
          }
        }
        return options.valueToColor(value, this.props)
      }

      handleChange = e => {
        const change = this.calculateChange(e, this.props, this.container)
        if (change && this.props.onChange) {
          this.props.onChange(change)
        }
      }

      handleStart = e => {
        this.handleChange(e)
        this.props.onMoveEvents({
          onMove: this.handleChange,
        })
      }

      render() {
        const {direction = 'horizontal'} = this.props

        const styles = {
          container: {
            position: 'relative',
            width: '100%',
            height: 48,
            borderRadius: this.props.radius,
            boxShadow: this.props.shadow,
          },
          slider: {
            position: 'absolute',
            top: 8,
            left: 0,
            right: 0,
            height: 32,
            background: `linear-gradient(
          ${direction === 'vertical' ? 'to bottom' : 'to right'},
          ${options.valueToCSS(options.minValue, this.props)} 0%,
          ${options.valueToCSS(
            (options.maxValue - options.minValue) / 2,
            this.props,
          )} 50%,
          ${options.valueToCSS(options.maxValue, this.props)} 100%
        )`,
          },
          pointerPosition: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: `translate${
              direction === 'vertical' ? 'Y' : 'X'
            }(${lerpi(
              options.minValue,
              options.maxValue,
              options.colorToValue(this.props),
            ) * 100}%)`,
          },
          pointer: {
            marginTop: '1px',
            width: '4px',
            borderRadius: '1px',
            height: '8px',
            boxShadow: '0 0 2px rgba(0, 0, 0, .6)',
            background: '#fff',
            transform: 'translateX(-2px)',
          },
        } as any

        return (
          <div style={styles.container}>
            <div
              style={styles.slider}
              ref={container => {
                this.container = container
              }}
              onMouseDown={this.handleStart}
              onTouchStart={this.handleStart}
            >
              <div style={styles.pointerPosition}>
                {this.props.pointer ? (
                  <this.props.pointer {...this.props} />
                ) : (
                  <CenteredHuePointer />
                )}
              </div>
            </div>
          </div>
        )
      }
    },
  )

const TemperatureSlider = colorSlider({
  minValue: minTemp,
  maxValue: maxTemp,
  colorToValue: ({rgb}) => rgb2colorTemperature(toLong(rgb)),
  valueToColor: fnCompose(toShort, colorTemperature2rgb),
  valueToCSS: value => {
    const alpha = lerpi(minTemp, maxTemp, value)
    return toCSS(
      alpha < 0.3
        ? lerpRGB(
            temperaturePresets.relax.color,
            temperaturePresets.everyday.color,
            lerp(0, 0.3, alpha),
          )
        : lerpRGB(
            temperaturePresets.everyday.color,
            temperaturePresets.focus.color,
            lerp(0.3, 1, alpha),
          ),
    )
  },
})

const SaturationSlider = colorSlider({
  minValue: 0,
  maxValue: 1,
  colorToValue: ({hsl}) => hsl.s,
  valueToColor: (s, {hsl}) => ({...hsl, s}),
  valueToCSS: (s, {hsl}) => `hsl(${hsl.h}, ${s * 100}%, ${hsl.l * 100}%)`,
})

const LightnessSlider = colorSlider({
  minValue: 0,
  maxValue: 1,
  colorToValue: ({hsl}) => hsl.l,
  valueToColor: (l, {hsl}) => ({...hsl, l}),
  valueToCSS: (l, {hsl}) => `hsl(${hsl.h}, ${hsl.s * 100}%, ${l * 100}%)`,
})

const PresetRow = glamorous.div(row({horizontal: 'center', vertical: 'center'}))

type LightningColorPickerProps = {
  color: Color
  onChange: (color: ColorResult) => void
}
type PrivateLightningColorPickerProps = LightningColorPickerProps &
  ColorResult & {
    index: number
    setIndex: (index: number) => void
    onChange: (color: Color) => void
  }

const LightningColorPicker = compose<
  PrivateLightningColorPickerProps,
  LightningColorPickerProps
>(
  CustomPicker,
  withState(
    'index',
    'setIndex',
    (props: ColorResult) =>
      inRange(minTemp, maxTemp, rgb2colorTemperature(toLong(props.rgb)))
        ? 0
        : 1,
  ),
)(({onChange, index, setIndex, ...props}) => (
  <InputEventsContainer>
    <div style={{...column(), overflow: 'hidden'}}>
      <Tabs value={index} onChange={(_, index) => setIndex(index)} fullWidth>
        <Tab
          label={<Typography>Temperature</Typography>}
          style={{maxWidth: 'none'}}
        />
        <Tab
          label={<Typography>Color</Typography>}
          style={{maxWidth: 'none'}}
        />
      </Tabs>

      <div style={{padding: 16, width: '75vw', maxWidth: 600}}>
        {index === 0 && (
          <>
            <TemperatureSlider onChange={onChange} {...props} />
            <PresetRow>
              {Object.values(temperaturePresets).map(({color, temp}) => (
                <ColorButton
                  key={temp}
                  big
                  color={toCSS(color)}
                  onClick={() => onChange(toShort(colorTemperature2rgb(temp)))}
                />
              ))}
            </PresetRow>
          </>
        )}
        {index === 1 && (
          <>
            <div style={{position: 'relative', height: 32, marginBottom: 8}}>
              <Hue
                onChange={onChange}
                {...props}
                pointer={CenteredHuePointer}
              />
            </div>
            <SaturationSlider onChange={onChange} {...props} />
            <LightnessSlider onChange={onChange} {...props} />
          </>
        )}
      </div>
    </div>
  </InputEventsContainer>
))

const StyledDialog = glamorous(Dialog)({
  '& section': {outline: 'none'},
})

export type ColorPickerProps = {
  color: {r: number; g: number; b: number}
  open: boolean
  onClose: () => void
  onChange: (color: ColorResult) => void
}

export const ColorPickerDialog = ({
  color,
  open,
  onClose,
  onChange,
}: ColorPickerProps) => (
  <StyledDialog open={open} onClose={onClose}>
    <DialogContent>
      <LightningColorPicker color={color} onChange={onChange} />
    </DialogContent>
  </StyledDialog>
)
