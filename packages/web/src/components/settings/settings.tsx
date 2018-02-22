import glamorous from 'glamorous'
import {title} from 'material-definitions'
import React from 'react'
import {Section} from 'react-material-app'
import {compose} from 'recompose'
import {row} from 'style-definitions'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {AppSettings, isInApp} from './app'
import {DeviceSettings} from './devices'
import {PluginSettings} from './plugins'

const Title = glamorous.h3(title)
const ListHeader = glamorous.div(row({vertical: 'center'}))

export type SettingsProps = {}
export type PrivateSettingsProps = SettingsProps & IsMobileProps & {}

const enhance = compose<PrivateSettingsProps, SettingsProps>(withIsMobile)

const SettingsList = ListDetail as React.StatelessComponent<
  ListDetailProps<
    {name: string; url: string; component: React.ComponentType},
    {}
  >
>

export const SettingsView = ({isMobile}: PrivateSettingsProps) => (
  <SettingsList
    path="/settings"
    data={{loading: false}}
    getItems={() => [
      {name: 'Devices', url: 'devices', component: DeviceSettings},
      {name: 'Plugins', url: 'plugins', component: PluginSettings},
      ...(isInApp ? [{name: 'App', url: 'app', component: AppSettings}] : []),
    ]}
    getSection={setting => ({
      title: setting.name,
      path: `/settings/${setting.url}`,
    })}
    renderItem={setting => (
      <ListItem key={setting.url} caption={setting.name} />
    )}
    renderActiveItem={setting => <setting.component />}
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
)

export const Settings = enhance(SettingsView)
