import glamorous from 'glamorous'
import {red} from 'material-definitions'
import Button from 'material-ui/Button'
import Card from 'material-ui/Card'
import Divider from 'material-ui/Divider'
import Icon from 'material-ui/Icon'
import IconButton from 'material-ui/IconButton'
import {insert, remove} from 'ramda'
import {
  ArrayProperty,
  Modification,
  NumberProperty,
} from 'raxa-common/lib/entities'
import React, {Component} from 'react'
import FlipMove from 'react-flip-move'
import {compose, mapProps, withState} from 'recompose'
import {updateIn} from 'redux-decorated'
import {row} from 'style-definitions'
import {fadeIn} from '../../lib/styles'
import {InjectedIdProps, withIds} from '../../with-id'
import {DeviceName} from '../device-name'
import {PropertyProps, PropertyView} from './property'

const CardContainer = glamorous.div(
  {
    padding: 16,
  },
  ({theme}: any) => ({
    color: theme.background.text,
    backgroundColor: theme.background.light,
  }),
)

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
  top: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,

  backgroundColor: red[500],

  ...fadeIn(),
})

const UndoDelete = ({item: _, onUndo}) => (
  <UndoContainer>
    <Button onClick={onUndo} style={{color: 'white'}}>
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

export class ArrayInputView extends Component<ArrayInputPrivateProps, {}> {
  didAdd = false

  render() {
    const {
      property,
      value,
      valueWithUndo,
      onChange,
      undoItem,
      setUndoItem,
      ids,
      replace,
    } = this.props

    return (
      <div>
        <TitleBar>
          {property.name && <Title>{property.name}</Title>}
          {property.modifiable && (
            <IconButton
              onClick={() => {
                onChange([
                  ...(value || []),
                  (property.items as NumberProperty).defaultValue !== undefined
                    ? (property.items as NumberProperty).defaultValue
                    : property.items.type === 'modification'
                      ? {}
                      : undefined,
                ])
                this.didAdd = true
              }}
            >
              <Icon>add</Icon>
            </IconButton>
          )}
        </TitleBar>
        <CardContainer>
          <FlipMove>
            {valueWithUndo.map((item, i) => {
              const index = undoItem && undoItem.index < i ? i - 1 : i

              return (
                <div key={ids[i]} style={{marginTop: i > 0 ? 24 : 0}}>
                  <div
                    ref={
                      valueWithUndo.length - 1 === i && this.didAdd
                        ? e => {
                            if (e) {
                              this.didAdd = false
                              e.scrollIntoView({behavior: 'smooth'})
                            }
                          }
                        : undefined
                    }
                  >
                    <Card style={{position: 'relative', overflow: 'visible'}}>
                      {property.modifiable && (
                        <div>
                          <ItemHeader>
                            {property.items.type === 'modification' && (
                              <SubTitle>
                                {(item as Modification).deviceId ? (
                                  <DeviceName
                                    id={(item as Modification).deviceId}
                                  />
                                ) : (
                                  'Add Device'
                                )}
                              </SubTitle>
                            )}
                            <IconButton
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
                            >
                              <Icon>delete</Icon>
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
                              onChange(
                                insert(undoItem.index, undoItem.item, value),
                              )
                              setUndoItem()
                            }}
                          />
                        )}
                    </Card>
                  </div>
                </div>
              )
            })}
          </FlipMove>
        </CardContainer>
      </div>
    )
  }
}

export const ArrayInput = enhance(ArrayInputView)
