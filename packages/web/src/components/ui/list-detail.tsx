import * as React from 'react'
import {GraphQLDataProps} from 'react-apollo/lib/graphql'
import {compose} from 'react-apollo/lib'
import withState from 'recompose/withState'
import {Column} from 'styled-material/dist/src/layout'
import {TwoPane} from './two-pane'
import {List, ListItem} from './list'
import {withPushState, WithPushStateProps} from './with-push-state'


export type ListDetailProps<E, T> = {
  data?: T & GraphQLDataProps
  getItems: (data: T & GraphQLDataProps) => Array<E>
  renderItem: (item: E, activate: () => void) => JSX.Element
  renderActiveItem: (item: E) => JSX.Element
}

export type PrivateListDetailProps = ListDetailProps<any, any> & WithPushStateProps<any> & {
  activeItem: any
  setActive: (item: any) => void
}

const enhance = compose(
  withState('activeItem', 'setActive', null),
  withPushState({onBack: ({setActive}) => setActive(null)})
)

export const ListDetailView = ({data, getItems, renderItem, renderActiveItem, activeItem, setActive, pushState}: PrivateListDetailProps) =>
  <TwoPane open={!!activeItem}>
    <List>
      {!data || data.loading
        ? <span>loading</span>
        : getItems(data).map(item =>
            <ListItem>
              {renderItem(item, () => {
                pushState({data: item, title: ''})
                setActive(item)
              })}
            </ListItem>
          )
      }
    </List>
    <Column style={{flex: 1}}>
      {activeItem && renderActiveItem(activeItem)}
    </Column>
  </TwoPane>

export const ListDetail = enhance(ListDetailView) as <E, T>(props: ListDetailProps<E, T>) => JSX.Element
