import {Property} from 'raxa-common'
import React from 'react'

export type WidgetProps<T = any> = {
  config: T
}

export type WidgetComponent<T = any, P = {}> = React.ComponentClass<
  WidgetProps<T> & P
> & {
  type: string
  defaultSize: {width: number; height: number}
  demoConfig: T
  uiName: string
  config?: {[id: string]: Property}
}

export type WidgetWrapperProps = {
  id: string
  children: React.ReactNode
  editMode?: boolean
}
