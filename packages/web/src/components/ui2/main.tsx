import glamorous from 'glamorous'
import {DeviceType, defaultInterfaces} from 'raxa-common'
import React from 'react'
import {ContextActions} from 'react-material-app'
import {connect} from 'react-redux'
import {Action, action, createActions, createReducer} from 'redux-decorated'
import {ListWidget} from '../dashboard/widgets/list'

const Ui2Container = glamorous.div(
  {
    boxSizing: 'border-box',
    paddingTop: 8,
    height: '100%',
  },
  ({theme}: any) => ({
    color: theme.background.text,
    backgroundColor: theme.dark
      ? theme.background.main
      : theme.background.light,
  }),
)

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
    <ContextActions contextActions={[{to: '/settings', icon: 'settings'}]} />
    <ListWidget
      header="Scenes"
      config={{interfaceIds: ['Scenery']}}
      sortOrder={sortOrders.Scenes}
      setSortOrder={sortOrder =>
        dispatch(action(actions.sortedWidgets, {section: 'Scenes', sortOrder}))
      }
    />
    <ListWidget
      header="Lighting"
      column
      config={{
        types: [DeviceType.Light, DeviceType.Outlet],
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
        )
      }
    />
    <ListWidget
      header="Media"
      column
      big
      config={{interfaceIds: ['CurrentlyPlaying', 'SonyReceiver']}}
    />
    <ListWidget
      header="Temperature"
      column
      config={{interfaceIds: ['Temperature']}}
    />
  </Ui2Container>
)

export const Ui2 = enhance(Ui2View)
