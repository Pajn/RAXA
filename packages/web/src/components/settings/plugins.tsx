import AppBar from 'material-ui/AppBar'
import List, {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List'
import Tabs, {Tab} from 'material-ui/Tabs'
import {PluginConfiguration} from 'raxa-common'
import React, {Component} from 'react'
import {QueryProps, gql, graphql} from 'react-apollo'
import {ProgressButton} from 'react-material-app'
import {Switch, SwitchProps} from 'react-material-app/lib/inputs/Switch'
import {Dispatch, connect} from 'react-redux'
import {compose, withStateHandlers} from 'recompose'
import {action} from 'redux-decorated'
import {column} from 'style-definitions'
import {actions} from '../../redux-snackbar/actions'

export type InstalledPluginsProps = {}
export type InstalledPluginsPrivateProps = InstalledPluginsProps & {
  dispatch: Dispatch
  data: QueryProps & {plugins?: Array<PluginConfiguration>}
  setPluginEnabled: (pluginId: string) => (enabled: boolean) => Promise<any>
}

export const installedPluginsEnhance = compose<
  InstalledPluginsPrivateProps,
  InstalledPluginsProps
>(
  connect(undefined, (dispatch): Partial<InstalledPluginsPrivateProps> => ({
    dispatch,
  })),
  graphql(gql`
    query getPlugins {
      plugins {
        id
        name
        shortDescription
        version
        enabled
      }
    }
  `),
  graphql<{}, InstalledPluginsPrivateProps>(
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
      }): Partial<InstalledPluginsPrivateProps> => ({
        setPluginEnabled: (pluginId: string) => (enabled: boolean) =>
          mutate!({
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
          }),
      }),
    },
  ),
)

export const InstalledPluginsView = ({
  data,
  setPluginEnabled,
}: InstalledPluginsPrivateProps) => (
  <List>
    {data.plugins &&
      data.plugins.map(plugin => (
        <ListItem key={plugin.id}>
          <ListItemText
            primary={plugin.name}
            secondary={plugin.shortDescription || ''}
          />
          <ListItemSecondaryAction>
            <AsyncSwitch
              value={plugin.enabled}
              onChange={setPluginEnabled(plugin.id)}
            />
          </ListItemSecondaryAction>
        </ListItem>
      ))}
  </List>
)

export const InstalledPlugins = installedPluginsEnhance(InstalledPluginsView)

export type AvaliblePluginsProps = {}
export type AvaliblePluginsPrivateProps = AvaliblePluginsProps & {
  dispatch: Dispatch
  data: QueryProps & {
    avaliblePlugins?: Array<
      PluginConfiguration & {installed: boolean; upgradable: boolean}
    >
  }
  installPlugin: (pluginId: string) => Promise<any>
  upgradePlugin: (pluginId: string) => Promise<any>
}

export const AvaliblePluginsEnhance = compose<
  AvaliblePluginsPrivateProps,
  AvaliblePluginsProps
>(
  connect(undefined, (dispatch): Partial<AvaliblePluginsPrivateProps> => ({
    dispatch,
  })),
  graphql(gql`
    query getPlugins {
      avaliblePlugins {
        id
        name
        description
        version
        availableVersion
        installed
        upgradable
      }
    }
  `),
  graphql<{}, AvaliblePluginsPrivateProps>(
    gql`
      mutation($pluginId: String!) {
        installPlugin(pluginId: $pluginId) {
          id
          enabled
          installed
        }
      }
    `,
    {
      props: ({
        mutate,
        ownProps: {dispatch},
      }): Partial<AvaliblePluginsPrivateProps> => ({
        installPlugin: (pluginId: string) =>
          mutate!({
            variables: {pluginId},
          }).catch(() => {
            dispatch(
              action(actions.showSnackbar, {
                label: `Failed to install plugin`,
                type: 'warning' as 'warning',
              }),
            )
          }),
      }),
    },
  ),
  graphql<{}, AvaliblePluginsPrivateProps>(
    gql`
      mutation($pluginId: String!) {
        upgradePlugin(pluginId: $pluginId) {
          id
          version
          upgradable
        }
      }
    `,
    {
      props: ({
        mutate,
        ownProps: {dispatch},
      }): Partial<AvaliblePluginsPrivateProps> => ({
        upgradePlugin: (pluginId: string) =>
          mutate!({
            variables: {pluginId},
          }).catch(() => {
            dispatch(
              action(actions.showSnackbar, {
                label: `Failed to upgrade plugin`,
                type: 'warning' as 'warning',
              }),
            )
          }),
      }),
    },
  ),
)

export const AvaliblePluginsView = ({
  data,
  installPlugin,
  upgradePlugin,
}: AvaliblePluginsPrivateProps) => (
  <List>
    {data.avaliblePlugins &&
      data.avaliblePlugins.map(plugin => (
        <ListItem key={plugin.id}>
          <ListItemText
            primary={plugin.name}
            secondary={plugin.description || ''}
          />
          <ListItemSecondaryAction>
            {plugin.upgradable ? (
              <ProgressButton onClick={() => upgradePlugin(plugin.id)}>
                Upgrade
              </ProgressButton>
            ) : plugin.installed ? (
              <ProgressButton disabled onClick={() => {}}>
                Installed
              </ProgressButton>
            ) : (
              <ProgressButton onClick={() => installPlugin(plugin.id)}>
                Install
              </ProgressButton>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
  </List>
)

export const AvaliblePlugins = AvaliblePluginsEnhance(AvaliblePluginsView)

export type PluginSettingsProps = {}
export type PluginSettingsPrivateProps = PluginSettingsProps & {
  tabIndex: number
  setTabIndex: (tabIndex: number) => void
}

export const enhance = compose<PluginSettingsPrivateProps, PluginSettingsProps>(
  withStateHandlers(
    {tabIndex: 0},
    {setTabIndex: () => tabIndex => ({tabIndex})},
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
  tabIndex,
  setTabIndex,
}: PluginSettingsPrivateProps) => (
  <div style={{...column(), overflow: 'hidden'}}>
    <AppBar position="static">
      <Tabs
        value={tabIndex}
        onChange={(_, tabIndex) => setTabIndex(tabIndex)}
        fullWidth
        color="primary"
      >
        <Tab label="Installed" style={{maxWidth: 'none'}} />
        <Tab label="Avalible" style={{maxWidth: 'none'}} />
      </Tabs>
    </AppBar>

    {tabIndex === 0 ? <InstalledPlugins /> : <AvaliblePlugins />}
  </div>
)

export const PluginSettings = enhance(PluginSettingsView)
