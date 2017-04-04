import {PropTypes, Validator} from 'react'

export type Section = {
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
  pushSection: (section: Section) => void
  popSection: (title: string) => void
  replaceTitle: (oldTitle: string, newTitle: string) => void

  setContextActions: (actions: Array<ContextAction>) => void
  clearContextActions: () => void
}

export const scaffoldContextType: {[p in keyof ScaffoldContext]: Validator<ScaffoldContext[p]>} = {
  pushSection: PropTypes.func,
  popSection: PropTypes.func,
  replaceTitle: PropTypes.func,

  setContextActions: PropTypes.func,
  clearContextActions: PropTypes.func,
}
