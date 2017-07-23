import {PluginConfiguration, PluginDefinition} from 'raxa-common'
import React from 'react'
import {QueryProps, gql, graphql} from 'react-apollo'
import {List, ListItem} from 'react-toolbox/lib/list'
import Switch from 'react-toolbox/lib/switch/Switch'
import {compose} from 'recompose'

export type PluginSettingsProps = {}
export type PluginSettingsPrivateProps = PluginSettingsProps & {
  data: QueryProps & {plugins?: Array<PluginDefinition & PluginConfiguration>}
}

export const enhance = compose<PluginSettingsPrivateProps, PluginSettingsProps>(
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
)

export const PluginSettingsView = ({data}: PluginSettingsPrivateProps) =>
  <List>
    {data.plugins &&
      data.plugins.map(plugin =>
        <ListItem
          key={plugin.id}
          caption={plugin.name}
          legend={plugin.shortDescription || ''}
          rightActions={[
            <Switch key="enabled" checked={plugin.enabled} disabled />,
          ]}
        />,
      )}
  </List>

export const PluginSettings = enhance(PluginSettingsView)
