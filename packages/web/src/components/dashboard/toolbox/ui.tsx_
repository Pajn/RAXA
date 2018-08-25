import {keyframes} from 'glamor'
import glamorous from 'glamorous'

const fadeInUp = keyframes({
  '0%': {
    opacity: 0.3,
    transform: 'translateY(100%)',
  },
  '100%': {
    opacity: 1,
    transform: '',
  },
})

export const ToolboxContainer = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  bottom: 0,
  width: '100%',

  animation: `${fadeInUp} 300ms ease-out`,
})
