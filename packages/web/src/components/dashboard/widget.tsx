import React from 'react'
import {Card} from 'react-toolbox/lib/card'
import {Cell, CellProps} from '../../grid/grid'

export type WidgetProps<T> = {
  config: T
}

export type WidgetWrapperProps = CellProps & {
  children: React.ReactNode
}

export const Widget = ({children, ...cellProps}: WidgetWrapperProps) =>
  <Cell {...cellProps}>
    <Card raised style={{padding: 8, height: '100%'}}>
      {children}
    </Card>
  </Cell>
