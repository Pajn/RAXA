import glamorous from 'glamorous'
import {grey, red} from 'material-definitions'
import {insert, remove} from 'ramda'
import {
  ArrayProperty,
  Modification,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React from 'react'
import FlipMove from 'react-flip-move'
import Button from 'react-toolbox/lib/button/Button'
import BadIconButton from 'react-toolbox/lib/button/IconButton'
import {Card} from 'react-toolbox/lib/card'
import {ListDivider} from 'react-toolbox/lib/list'
import {compose, mapProps, withState} from 'recompose'
import {updateIn} from 'redux-decorated'
import {row} from 'style-definitions'
import {fadeIn} from '../../lib/styles'
import {InjectedIdProps, withIds} from '../../with-id'
import {DeviceName} from '../device-name'
import {PropertyProps, PropertyView} from './property'

const IconButton: any = BadIconButton

const CardContainer = glamorous.div({
  padding: 16,
  backgroundColor: grey[100],
})

const ItemHeader = glamorous.div({...row({vertical: 'center'}), padding: 8})

const TitleBar = glamorous.span({
  display: 'flex',
  alignItems: 'center',

  padding: '4px 8px',
})

const Title = glamorous.span({
  flex: 1,
  fontSize: 18,
})

const SubTitle = glamorous.span({
  flex: 1,
  fontSize: 16,
})

const UndoContainer = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: 1,

  backgroundColor: red[500],

  ...fadeIn(),
})

const UndoDelete = ({item: _, onUndo}) => (
  <UndoContainer>
    <Button inverse onClick={onUndo}>
      Undo
    </Button>
  </UndoContainer>
)

export type ArrayInputProps<T = any> = PropertyProps<ArrayProperty<T>, Array<T>>
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

export const ArrayInputView = ({
  property,
  value,
  valueWithUndo,
  onChange,
  undoItem,
  setUndoItem,
  ids,
  replace,
}: ArrayInputPrivateProps) => (
  <div>
    <TitleBar>
      {property.name && <Title>{property.name}</Title>}
      {property.modifiable && (
        <IconButton
          icon="add"
          onClick={() =>
            onChange([
              ...(value || []),
              (property.items as NumberProperty).defaultValue !== undefined
                ? (property.items as NumberProperty).defaultValue
                : property.items.type === 'modification' ? {} : undefined,
            ])}
        />
      )}
    </TitleBar>
    <CardContainer>
      <FlipMove>
        {valueWithUndo.map((item, i) => {
          const index = undoItem && undoItem.index < i ? i - 1 : i

          return (
            <div key={ids[i]} style={{marginTop: i > 0 ? 24 : 0}}>
              <Card style={{position: 'relative', overflow: 'visible'}}>
                {property.modifiable && (
                  <div>
                    <ItemHeader>
                      {property.items.type === 'modification' && (
                        <SubTitle>
                          {(item as Modification).deviceId ? (
                            <DeviceName id={(item as Modification).deviceId} />
                          ) : (
                            'Add Device'
                          )}
                        </SubTitle>
                      )}
                      <IconButton
                        icon="delete"
                        onClick={() => {
                          onChange(remove(index, 1, value))
                          if (
                            value[index] &&
                            (property.items.type !== 'modification' ||
                              value[index].statusId)
                          ) {
                            setUndoItem({index, item: value[index]})
                          } else {
                            setUndoItem()
                          }
                        }}
                      />
                    </ItemHeader>
                    <ListDivider />
                  </div>
                )}
                <div style={{padding: '8px 16px'}}>
                  <PropertyView
                    property={property.items}
                    value={item}
                    onChange={updated => {
                      const newValue = updateIn(index, updated, value)
                      replace(ids[i], newValue[index])
                      onChange(newValue)
                    }}
                  />
                </div>
                {undoItem &&
                  undoItem.index === i && (
                    <UndoDelete
                      item={undoItem}
                      onUndo={() => {
                        onChange(insert(undoItem.index, undoItem.item, value))
                        setUndoItem()
                      }}
                    />
                  )}
              </Card>
            </div>
          )
        })}
      </FlipMove>
    </CardContainer>
  </div>
)

export const ArrayInput = enhance(ArrayInputView)
