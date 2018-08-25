import loadable from 'loadable-components'
import React from 'react'
import {ColorResult} from 'react-color'
import {compose} from 'recompose'
import {withThrottledMutation} from '../../with-throttled-mutation'
import {ColorButton} from '../dashboard/widgets/ui/light-button'
import {IsMobileProps, withIsMobile} from './mediaQueries'

export const LazyColorPickerDialog = loadable(() =>
  import('./color-picker-dialog').then(module => module.ColorPickerDialog),
)

export type ColorPickerProps = {
  value: number
  onChange: (color: number) => void
}
export type PrivateColorPickerProps = ColorPickerProps & IsMobileProps

export const ColorPicker = compose<PrivateColorPickerProps, ColorPickerProps>(
  withIsMobile,
  withThrottledMutation<PrivateColorPickerProps>(
    100,
    'value',
    'onChange',
    (value, {onChange}) => onChange(value),
  ),
)(
  class ColorPicker extends React.Component<PrivateColorPickerProps> {
    state = {
      displayColorPicker: false,
    }

    handleClick = () => {
      this.setState({displayColorPicker: !this.state.displayColorPicker})
    }

    handleClose = () => {
      this.setState({displayColorPicker: false})
    }

    handleChange = (color: ColorResult) => {
      this.props.onChange(
        (color.rgb.r << 16) + (color.rgb.g << 8) + color.rgb.b,
      )
    }

    render() {
      const red = (this.props.value & 0xff0000) >> 16
      const green = (this.props.value & 0x00ff00) >> 8
      const blue = this.props.value & 0x0000ff
      const styles = {
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      } as any

      return (
        <div onTouchStart={e => e.stopPropagation()}>
          <ColorButton
            color={`rgb(${red}, ${green}, ${blue})`}
            onClick={this.handleClick}
          />
          <div style={styles.swatch} onClick={this.handleClick}>
            <div style={styles.color} />
          </div>
          <LazyColorPickerDialog
            open={this.state.displayColorPicker}
            onClose={this.handleClose}
            color={{r: red, g: green, b: blue}}
            onChange={this.handleChange}
          />
        </div>
      )
    }
  },
)
