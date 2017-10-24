import {History} from 'history'
import PropTypes from 'prop-types'
import {Placement} from '../actions'

export type Section = {
  path?: string
  title: string
  onBack?: (history: History) => void
  onUnload?: () => void
}

export type ContextAction = {
  disabled?: boolean
  label?: string
  href?: string
  icon?: string
  onClick?: () => void
  placement?: Placement
}

export type ContextMenu = ContextAction & {
  menuItems?: Array<ContextAction>
}

export type ScaffoldContext = {
  activeSection?: Section

  pushSection: (section: Section) => void
  popSection: (title: string) => void
  replaceSection: (newSection: Section, oldTitle?: string) => void

  setContextActions: (actions: Array<ContextAction>) => void
  clearContextActions: () => void
}

export const scaffoldContextType: {
  [p in keyof ScaffoldContext]: PropTypes.Validator<ScaffoldContext[p]>
} = {
  activeSection: PropTypes.object,

  pushSection: PropTypes.func,
  popSection: PropTypes.func,
  replaceSection: PropTypes.func,

  setContextActions: PropTypes.func,
  clearContextActions: PropTypes.func,
}
