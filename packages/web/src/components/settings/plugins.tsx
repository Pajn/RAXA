import {PluginConfiguration, PluginDefinition} from 'raxa-common'
import React, {Component} from 'react'
import {QueryProps, gql, graphql} from 'react-apollo'
import {Dispatch, connect} from 'react-redux'
import {List, ListItem} from 'react-toolbox/lib/list'
import Switch, {SwitchProps} from 'react-toolbox/lib/switch/Switch'
import {compose} from 'recompose'
import {action} from 'redux-decorated'
import {actions} from '../../redux-snackbar/actions'

export type PluginSettingsProps = {}
export type PluginSettingsPrivateProps = PluginSettingsProps & {
  dispatch: Dispatch
  data: QueryProps & {plugins?: Array<PluginDefinition & PluginConfiguration>}
  setPluginEnabled: (pluginId: string) => (enabled: boolean) => Promise<any>
}

export const enhance = compose<PluginSettingsPrivateProps, PluginSettingsProps>(
  connect(undefined, (dispatch): Partial<PluginSettingsPrivateProps> => ({
    dispatch,
  })),
  graphql(gql`
    query getPlugins {
      plugins {
        id
        name
        shortDescription
        enabled
      }
    }
  `),
  graphql<{}, PluginSettingsPrivateProps>(
    gql`
    mutation($pluginId: String!, $enabled: Boolean!) {
      setPluginEnabled(pluginId: $pluginId, enabled: $enabled) {
        id
        enabled
      }
    }
  `,
    {
      props: ({
        mutate,
        ownProps: {dispatch},
      }): Partial<PluginSettingsPrivateProps> => ({
        setPluginEnabled: (pluginId: string) => (enabled: boolean) => {
          return mutate!({
            variables: {pluginId, enabled},
            optimisticResponse: {
              __typename: 'Mutation',
              setPluginEnabled: {
                __typename: 'Plugin',
                id: pluginId,
                enabled,
              },
            },
          }).catch(() => {
            dispatch(
              action(actions.showSnackbar, {
                label: `Failed to ${enabled ? 'enable' : 'disable'} plugin`,
                type: 'warning' as 'warning',
              }),
            )
          })
        },
      }),
    },
  ),
)

export class AsyncSwitch extends Component<SwitchProps, {loading: boolean}> {
  state = {loading: false}

  render() {
    return (
      <Switch
        {...this.props}
        disabled={this.state.loading || this.props.disabled}
        onChange={
          this.props.onChange &&
          (async value => {
            try {
              this.setState({loading: true})
              await this.props.onChange!(value)
            } finally {
              this.setState({loading: false})
            }
          })
        }
      />
    )
  }
}

export const PluginSettingsView = ({
  data,
  setPluginEnabled,
}: PluginSettingsPrivateProps) =>
  <List>
    {data.plugins &&
      data.plugins.map(plugin =>
        <ListItem
          key={plugin.id}
          caption={plugin.name}
          legend={plugin.shortDescription || ''}
          rightActions={[
            <AsyncSwitch
              key="enabled"
              checked={plugin.enabled}
              onChange={setPluginEnabled(plugin.id)}
            />,
          ]}
        />,
      )}
  </List>

export const PluginSettings = enhance(PluginSettingsView)
