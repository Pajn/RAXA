import {PropTypes, Validator} from 'react'

export type Section = {
  path?: string
  title: string
  onBack: () => void
}

export type ContextAction = {
  disabled?: boolean
  label: string
  icon?: string
  onClick?: () => void
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

export const scaffoldContextType: {[p in keyof ScaffoldContext]: Validator<ScaffoldContext[p]>} = {
  activeSection: PropTypes.object,

  pushSection: PropTypes.func,
  popSection: PropTypes.func,
  replaceSection: PropTypes.func,

  setContextActions: PropTypes.func,
  clearContextActions: PropTypes.func,
}
