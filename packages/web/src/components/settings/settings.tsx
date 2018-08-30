import gql from 'graphql-tag'
import {title} from 'material-definitions'
import React from 'react'
import Query from 'react-apollo/Query'
import styled from 'react-emotion'
import {Section} from 'react-material-app/lib/scaffold/Section'
import {compose} from 'recompose'
import {row} from 'style-definitions'
import {baseHttpUrl} from '../../lib/store'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {AppSettings} from './app'
import {DeviceSettings} from './devices'
import {PluginSettings} from './plugins'
import {SystemSettings} from './system'

const Title = styled('h3')(title)
const ListHeader = styled('div')(row({vertical: 'center'}))

export type SettingsProps = {}
export type PrivateSettingsProps = SettingsProps & IsMobileProps & {}

const enhance = compose<PrivateSettingsProps, SettingsProps>(withIsMobile)

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

export const SettingsView = ({isMobile}: PrivateSettingsProps) => (
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
          isMobile ? (
            <Section title="Settings" onBack={history => history.goBack()} />
          ) : (
            <Section title="Settings" onBack={history => history.goBack()}>
              <ListHeader>
                <Title style={{flex: 1}}>Settings</Title>
              </ListHeader>
            </Section>
          )
        }
      />
    )}
  </Query>
)

export const Settings = enhance(SettingsView)
