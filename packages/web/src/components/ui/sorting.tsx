import loadable from 'loadable-components'
import React from 'react'

export const LazyDragDropContext = loadable(
  () => import('react-beautiful-dnd').then(module => module.DragDropContext),
  {
    render: ({Component, loading, ownProps}) => {
      if (loading) return (ownProps as any).children
      return <Component {...ownProps} />
    },
  },
)
export const LazyDraggable = loadable(
  () => import('react-beautiful-dnd').then(module => module.Draggable),
  {
    render: ({Component, loading, ownProps}) => {
      if (loading)
        return ownProps.children(
          {
            draggableProps: {},
            dragHandleProps: {},
          } as any,
          {isDragging: false},
        )
      return <Component {...ownProps} />
    },
  },
)
export const LazyDroppable = loadable(
  () => import('react-beautiful-dnd').then(module => module.Droppable),
  {
    render: ({Component, loading, ownProps}) => {
      if (loading)
        return ownProps.children(
          {
            droppableProps: {},
          } as any,
          {isDraggingOver: false},
        )
      return <Component {...ownProps} />
    },
  },
)

export function reorder<T>(
  list: Array<T>,
  startIndex: number,
  endIndex: number,
) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}
