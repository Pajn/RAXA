import gql from 'graphql-tag'
import React from 'react'
import Query from 'react-apollo/Query'
import {Section} from 'react-material-app/lib/scaffold/Section'
import {Route} from 'react-router'
import {baseHttpUrl} from '../../lib/store'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {AppSettings} from './app'
import {DeviceSettings} from './devices'
import {Filler, PluginSettings} from './plugins'
import {SystemSettings} from './system'

const SettingsList = ListDetail as React.StatelessComponent<
  ListDetailProps<
    {name: string; url: string; component: React.ComponentType; props?: object},
    {}
  >
>

const listPluginsWithHttpEndpointQuery = gql`
  query getPluginsWithHttpEndpoint {
    plugins(httpEndpoint: true, enabled: true) {
      id
      name
    }
  }
`

const PluginContainer = ({pluginId}: {pluginId: string}) => (
  <iframe
    src={`${baseHttpUrl}/plugin/${pluginId}`}
    style={{
      flexGrow: 1,
      border: 'none',
    }}
  />
)

export const Settings = () => (
  <Query query={listPluginsWithHttpEndpointQuery}>
    {({data}) => (
      <SettingsList
        path="/settings"
        data={{loading: false}}
        getItems={() => [
          {name: 'Devices', url: 'devices', component: DeviceSettings},
          {name: 'Plugins', url: 'plugins', component: PluginSettings},
          {name: 'System', url: 'system', component: SystemSettings},
          {name: 'App', url: 'app', component: AppSettings},
          ...(data && data.plugins
            ? data.plugins.map(plugin => ({
                name: plugin.name,
                url: `plugin/${plugin.id}`,
                component: PluginContainer,
                props: {pluginId: plugin.id},
              }))
            : []),
        ]}
        getSection={setting => ({
          title: setting.name,
          path: `/settings/${setting.url}`,
        })}
        renderItem={setting => (
          <ListItem key={setting.url} caption={setting.name} button />
        )}
        renderActiveItem={setting => <setting.component {...setting.props} />}
        listHeader={
          <>
            <Section title="Settings" onBack={history => history.goBack()} />
            <Route path="/settings/plugins" render={() => <Filler />} />
          </>
        }
      />
    )}
  </Query>
)
