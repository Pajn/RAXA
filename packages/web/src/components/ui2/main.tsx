import glamorous from 'glamorous'
import {grey} from 'material-definitions'
import {defaultInterfaces} from 'raxa-common'
import React from 'react'
import {connect} from 'react-redux'
import {ListSubHeader} from 'react-toolbox/lib/list'
import {Action, action, createActions, createReducer} from 'redux-decorated'
import {ListWidget} from '../dashboard/widgets/list'
import {ContextActions} from '../ui/scaffold/context-actions'

const Ui2Container = glamorous.div({
  paddingTop: 8,
  height: '100%',
  backgroundColor: grey[50],
})

export const actions = createActions({
  sortedWidgets: {} as Action<{section: string; sortOrder: Array<string>}>,
})

export const reducer = createReducer<{
  [section: string]: Array<string>
}>({})
  .when(actions.sortedWidgets, (state, {section, sortOrder}) => ({
    ...state,
    [section]: sortOrder,
  }))
  .build()

const enhance = connect(state => ({sortOrders: state.mainScreen}))

export const Ui2View = ({sortOrders, dispatch}) => (
  <Ui2Container>
    <ContextActions contextActions={[{href: '/settings', icon: 'settings'}]} />
    <ListSubHeader caption="Scenes" />
    <ListWidget
      config={{interfaceIds: ['Scenery']}}
      sortOrder={sortOrders.Scenes}
      setSortOrder={sortOrder =>
        dispatch(action(actions.sortedWidgets, {section: 'Scenes', sortOrder}))}
    />
    <ListSubHeader caption="Lighting" />
    <ListWidget
      column
      config={{
        interfaceIds: [
          defaultInterfaces.Power.id,
          defaultInterfaces.Dimmer.id,
          defaultInterfaces.Color.id,
        ],
      }}
      sortOrder={sortOrders.Lighting}
      setSortOrder={sortOrder =>
        dispatch(
          action(actions.sortedWidgets, {section: 'Lighting', sortOrder}),
        )}
    />
    <ListSubHeader caption="Temperature" />
    <ListWidget column config={{interfaceIds: ['Temperature']}} />
  </Ui2Container>
)

export const Ui2 = enhance(Ui2View)
