import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import {red} from 'material-definitions'
import {insert, remove} from 'ramda'
import {
  ArrayProperty,
  Modification,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React, {Component} from 'react'
import {DropResult} from 'react-beautiful-dnd'
import styled from 'react-emotion'
import {compose, mapProps, withState} from 'recompose'
import {updateIn} from 'redux-decorated'
import {row} from 'style-definitions'
import {fadeIn} from '../../lib/styles'
import {Theme} from '../../theme'
import {InjectedIdProps, withIds} from '../../with-id'
import {DeviceName} from '../device-name'
import {
  LazyDragDropContext,
  LazyDraggable,
  LazyDroppable,
  reorder,
} from '../ui/sorting'
import {PropertyProps, PropertyView} from './property'

export type ArrayInputProps<T = any> = PropertyProps<ArrayProperty<T>, Array<T>>

const CardContainer = styled('div')<{}, Theme>(({theme}) => ({
  padding: 16,
  color: theme.background.text,
  backgroundColor: theme.background.light,
}))

const ItemHeader = styled('div')({...row({vertical: 'center'}), padding: 8})

const TitleBar = styled('div')<{}, Theme>(({theme}) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1,

  display: 'flex',
  alignItems: 'center',

  padding: '4px 8px',
  backgroundColor: theme.background.main,
}))

const Title = styled('span')({
  flex: 1,
  fontSize: 18,
})

const SubTitle = styled('span')({
  flex: 1,
  fontSize: 16,
})

const UndoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  position: 'absolute',
  top: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,

  backgroundColor: red[500],

  ...fadeIn(),
})

const UndoDelete = ({onUndo}) => (
  <UndoContainer>
    <Button onClick={onUndo} style={{color: 'white'}}>
      Undo
    </Button>
  </UndoContainer>
)

class PropertyCard extends React.PureComponent<
  {
    id: string
    replace: (id: string, newValue: any) => void
    index: number
    didAdd: boolean
    isLast: boolean
    clearDidAdd: () => void
    onDelete: (index: number) => void
    item: any
    undoItem?: {index: number; item: any}
    clearUndoItem: () => void
  } & Pick<ArrayInputProps, 'property' | 'onChange' | 'value'>,
  {}
> {
  render() {
    const {
      id,
      replace,
      index,
      didAdd,
      isLast,
      clearDidAdd,
      property,
      value,
      onChange,
      onDelete,
      item,
      undoItem,
      clearUndoItem,
    } = this.props

    return (
      <div
        ref={
          isLast && didAdd
            ? e => {
                if (e) {
                  clearDidAdd()
                  e.scrollIntoView({behavior: 'smooth'})
                }
              }
            : undefined
        }
      >
        <Card
          style={{
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {property.modifiable && (
            <div>
              <ItemHeader>
                {(property.items.type === 'modification' ||
                  property.items.type === 'action') && (
                  <SubTitle>
                    {(item as Modification).deviceId ? (
                      <DeviceName id={(item as Modification).deviceId} />
                    ) : (
                      'Add Device'
                    )}
                  </SubTitle>
                )}
                <IconButton onClick={() => onDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </ItemHeader>
              <Divider />
            </div>
          )}
          <div style={{padding: '8px 16px'}}>
            <PropertyView
              propertyId={property.items.id}
              property={property.items}
              value={item}
              onChange={updated => {
                const newValue = updateIn(index, updated, value)
                replace(id, newValue[index])
                onChange(newValue)
              }}
            />
          </div>
          {undoItem && (
            <UndoDelete
              onUndo={() => {
                onChange(insert(undoItem.index, undoItem.item, value))
                clearUndoItem()
              }}
            />
          )}
        </Card>
      </div>
    )
  }
}

export type ArrayInputPrivateProps<T = any> = ArrayInputProps<T> &
  InjectedIdProps & {
    undoItem?: {index: number; item: T}
    setUndoItem: (undoItem?: {index: number; item: T}) => void
    valueWithUndo: ArrayInputProps<T>['value']
  }

export const enhance = compose<ArrayInputPrivateProps, ArrayInputProps>(
  withState('undoItem', 'setUndoItem', null),
  mapProps<ArrayInputPrivateProps, ArrayInputPrivateProps>(
    props =>
      props.undoItem
        ? {
            ...props,
            valueWithUndo: insert(
              props.undoItem.index,
              props.undoItem.item,
              props.value,
            ),
          }
        : {...props, valueWithUndo: props.value || []},
  ),
  withIds('valueWithUndo'),
)

export class ArrayInputView extends Component<ArrayInputPrivateProps, {}> {
  didAdd = false

  clearDidAdd = () => (this.didAdd = false)
  clearUndoItem = () => {
    this.props.setUndoItem()
  }

  onDelete = (index: number) => {
    const {property, value, onChange, setUndoItem} = this.props

    onChange(remove(index, 1, value))
    if (
      value[index] &&
      ((property.items.type !== 'modification' &&
        property.items.type !== 'action') ||
        value[index].statusId)
    ) {
      setUndoItem({
        index,
        item: value[index],
      })
    } else {
      setUndoItem()
    }
  }

  onSortEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const sorted = reorder(
      this.props.value,
      result.source.index,
      result.destination.index,
    )
    this.props.onChange(sorted)
  }

  render() {
    const {
      property,
      value,
      valueWithUndo,
      onChange,
      undoItem,
      ids,
      replace,
    } = this.props

    return (
      <LazyDragDropContext onDragEnd={this.onSortEnd}>
        <div>
          <TitleBar>
            {property.name && <Title>{property.name}</Title>}
            {property.modifiable && (
              <IconButton
                onClick={() => {
                  onChange([
                    ...(value || []),
                    (property.items as NumberProperty).defaultValue !==
                    undefined
                      ? (property.items as NumberProperty).defaultValue
                      : property.items.type === 'modification' ||
                        property.items.type === 'action'
                        ? {}
                        : undefined,
                  ])
                  this.didAdd = true
                }}
              >
                <AddIcon />
              </IconButton>
            )}
          </TitleBar>
          <LazyDroppable
            droppableId={`property-${property.id}`}
            direction="vertical"
          >
            {provided => (
              <CardContainer innerRef={provided.innerRef}>
                {valueWithUndo.map((item, i) => {
                  const index = undoItem && undoItem.index < i ? i - 1 : i

                  return (
                    <LazyDraggable
                      key={ids[i]}
                      draggableId={`property-${property.id}-${ids[i]}`}
                      index={i}
                    >
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            marginTop: i > 0 ? 24 : 0,
                            ...provided.draggableProps.style,
                          }}
                        >
                          <PropertyCard
                            id={ids[i]}
                            replace={replace}
                            item={item}
                            index={index}
                            property={property}
                            onChange={onChange}
                            value={value}
                            didAdd={this.didAdd}
                            clearDidAdd={this.clearDidAdd}
                            onDelete={this.onDelete}
                            isLast={valueWithUndo.length - 1 === i}
                            undoItem={
                              undoItem && undoItem.index === i
                                ? undoItem
                                : undefined
                            }
                            clearUndoItem={this.clearUndoItem}
                          />
                        </div>
                      )}
                    </LazyDraggable>
                  )
                })}
              </CardContainer>
            )}
          </LazyDroppable>
        </div>
      </LazyDragDropContext>
    )
  }
}

export const ArrayInput = enhance(ArrayInputView)
