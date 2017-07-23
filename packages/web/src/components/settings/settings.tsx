import glamorous from 'glamorous'
import React from 'react'
import {compose} from 'recompose'
import {row} from 'style-definitions'
import {Title} from 'styled-material/lib/typography'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {Section} from '../ui/scaffold/section'
import {DeviceSettings} from './devices'
import {PluginSettings} from './plugins'

const ListHeader = glamorous.div(row({vertical: 'center'}))

export type SettingsProps = {}
// export type ListGraphQlData = {devices: Array<GraphQlDevice>}
export type PrivateSettingsProps = SettingsProps &
  IsMobileProps & {
    // data: ListGraphQlData & QueryProps
  }

const enhance = compose<PrivateSettingsProps, SettingsProps>(
  // graphql(gql`
  //   query {
  //     devices {
  //       id
  //       name
  //       config
  //       deviceClass {
  //         id
  //         name
  //         config
  //       }
  //       interfaces {
  //         id
  //         name
  //         methods
  //       }
  //     }
  //   }
  // `),
  // withState('newDevice', 'setNewDevice', null),
  // withState('createNewDevice', '', props => () =>
  //   props.setNewDevice({interfaces: []}),
  // ),
  withIsMobile,
)

const SettingsList = ListDetail as React.StatelessComponent<
  ListDetailProps<
    {name: string; url: string; component: React.ComponentType},
    {}
  >
>

export const SettingsView = ({isMobile}: PrivateSettingsProps) =>
  <SettingsList
    path="/settings"
    data={{loading: false}}
    getItems={() => [
      {name: 'Devices', url: 'devices', component: DeviceSettings},
      {name: 'Plugins', url: 'plugins', component: PluginSettings},
    ]}
    getSection={setting => ({
      title: setting.name,
      path: `/settings/${setting.url}`,
    })}
    renderItem={setting =>
      <ListItem key={setting.url} caption={setting.name} />}
    renderActiveItem={setting => <setting.component />}
    listHeader={
      isMobile
        ? <Section title="Settings" onBack={history => history.goBack()} />
        : <ListHeader>
            <Title style={{flex: 1}}>Settings</Title>
          </ListHeader>
    }
  />

export const Settings = enhance(SettingsView)
