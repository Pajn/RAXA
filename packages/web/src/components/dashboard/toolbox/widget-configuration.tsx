import glamorous from 'glamorous'
import React from 'react'
import {Card} from 'react-toolbox/lib/card'
import {compose} from 'recompose'
import {Title} from 'styled-material/dist/src/typography'
import {connectState} from '../../../with-lazy-reducer'
import {PropertyView} from '../../properties/property'
import {SettingForm} from '../../ui/setting-form'
import {WidgetConfig, dashboardState} from '../state'
import {WidgetComponent} from '../widget'
import {ToolboxContainer} from './ui'

const Container = glamorous(Card)({
  display: 'flex',
  padding: 16,

  ':not(#id)': {
    width: 800,
    flexDirection: 'row',
  },

  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 16,
  },
  '& h3': {
    marginTop: 0,
  },
})

export type WidgetConfigurationProps = {widgetId: string}
export type WidgetConfigurationPrivateProps = WidgetConfigurationProps & {
  widget: WidgetConfig
  widgetType: WidgetComponent
  updateWidget: (widget: WidgetConfig) => void
}

export const enhance = compose<
  WidgetConfigurationPrivateProps,
  WidgetConfigurationProps
>(
  connectState(
    dashboardState,
    (state, {widgetId}: WidgetConfigurationProps) => {
      const widget = state.widgets.find(widget => widget.id === widgetId)!
      return {
        widget,
        widgetType: state.widgetTypes[widget.type],
      }
    },
    dispatch => ({
      updateWidget: (widget: WidgetConfig) =>
        dispatch({
          type: 'updateWidget',
          widget: {id: widget.id, config: widget.config},
        }),
    }),
  ),
)

export const WidgetConfigurationView = ({
  widget,
  widgetType,
  updateWidget,
}: WidgetConfigurationPrivateProps) =>
  <ToolboxContainer>
    <Container>
      <Title>{widgetType.uiName}</Title>
      <div>
        {widgetType.config &&
          <SettingForm
            value={widget}
            fields={Object.entries(widgetType.config).map(([id, config]) => ({
              path: ['config', id],
              component: PropertyView,
              label: id,
              property: config,
              required: !config.optional && config.modifiable,
            }))}
            onSave={updateWidget}
            onChange={(widget, valid) => valid && updateWidget(widget)}
          />}
      </div>
    </Container>
  </ToolboxContainer>

export const WidgetConfiguration = enhance(WidgetConfigurationView)
