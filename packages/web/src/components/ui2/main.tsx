import glamorous from 'glamorous'
import {DeviceType, defaultInterfaces} from 'raxa-common'
import React from 'react'
import {ContextActions} from 'react-material-app'
import {connect} from 'react-redux'
import {Action, action, createActions, createReducer} from 'redux-decorated'
import {ListWidget, WidgetConfiguration} from '../dashboard/widgets/list'

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
  configuredWidgets: {} as Action<{
    section: string
    configuration: Partial<WidgetConfiguration>
  }>,
})

export const reducer = createReducer<{
  [section: string]: Array<string>
}>({})
  .when(actions.configuredWidgets, (state, {section, configuration}) => ({
    ...state,
    [section]: {hidden: [], sortOrder: [], ...state[section], ...configuration},
  }))
  .build()

const enhance = connect(state => ({configurations: state.mainScreen}))

export const Ui2View = ({configurations, dispatch}) => (
  <Ui2Container>
    <ContextActions contextActions={[{to: '/settings', icon: 'settings'}]} />
    <ListWidget
      header="Scenes"
      config={{interfaceIds: ['Scenery']}}
      configuration={configurations.Scenes}
      setConfiguration={configuration =>
        dispatch(
          action(actions.configuredWidgets, {section: 'Scenes', configuration}),
        )
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
      configuration={configurations.Lighting}
      setConfiguration={configuration =>
        dispatch(
          action(actions.configuredWidgets, {
            section: 'Lighting',
            configuration,
          }),
        )
      }
    />
    <ListWidget
      header="Media"
      column
      big
      config={{interfaceIds: ['CurrentlyPlaying', 'SonyReceiver']}}
      configuration={configurations.Media}
      setConfiguration={configuration =>
        dispatch(
          action(actions.configuredWidgets, {section: 'Media', configuration}),
        )
      }
    />
    <ListWidget
      header="Temperature"
      column
      config={{interfaceIds: ['Temperature']}}
      configuration={configurations.Temperature}
      setConfiguration={configuration =>
        dispatch(
          action(actions.configuredWidgets, {
            section: 'Temperature',
            configuration,
          }),
        )
      }
    />
  </Ui2Container>
)

export const Ui2 = enhance(Ui2View)
