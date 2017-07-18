import Flexbox from 'flexbox-react'
import {GraphQlDevice} from 'raxa-common/lib/entities'
import React from 'react'
import {gql, graphql} from 'react-apollo'
import {QueryProps} from 'react-apollo/lib/graphql'
import BadIconButton from 'react-toolbox/lib/button/IconButton'
import {compose, withState} from 'recompose'
import {Title} from 'styled-material/dist/src/typography'
import {ListItem} from '../ui/list'
import {ListDetail, ListDetailProps} from '../ui/list-detail'
import {IsMobileProps, withIsMobile} from '../ui/mediaQueries'
import {ContextActions} from '../ui/scaffold/context-actions'
import {Section} from '../ui/scaffold/section'
import {DeviceDetailSettings} from './device-detail'

const IconButton: any = BadIconButton

export type DeviceSettingsProps = {}
export type ListGraphQlData = {devices: Array<GraphQlDevice>}
export type PrivateDeviceSettingsProps = DeviceSettingsProps &
  IsMobileProps & {
    data: ListGraphQlData & QueryProps
    newDevice?: GraphQlDevice
    setNewDevice: (newDevice?: Partial<GraphQlDevice>) => void
    createNewDevice: () => void
  }

const enhance = compose(
  graphql(gql`
    query {
      devices {
        id
        name
        config
        deviceClass {
          id
          name
          config
        }
        interfaces {
          id
          name
          methods
        }
      }
    }
  `),
  withState('newDevice', 'setNewDevice', null),
  withState('createNewDevice', '', props => () => props.setNewDevice({})),
  withIsMobile,
)

const DeviceList = ListDetail as React.StatelessComponent<
  ListDetailProps<GraphQlDevice, PrivateDeviceSettingsProps['data']>
>

export const DeviceSettingsView = ({
  data,
  newDevice,
  createNewDevice,
  setNewDevice,
  isMobile,
}: PrivateDeviceSettingsProps) =>
  <DeviceList
    path="/settings/devices"
    data={data}
    getItems={data => data.devices || []}
    getSection={device => ({
      title: device.name,
      path: `/settings/devices/${device.id}`,
    })}
    renderItem={device => <ListItem key={device.id} caption={device.name} />}
    renderActiveItem={device => <DeviceDetailSettings device={device} />}
    activeItem={
      newDevice && {
        item: newDevice,
        section: {
          title: 'New Device',
          path: '/settings/devices/new',
          onUnload: () => setNewDevice(undefined),
        },
      }
    }
    listHeader={
      isMobile
        ? <Section title="Devices" onBack={history => history.goBack()}>
            <ContextActions
              contextActions={[
                {
                  icon: 'add',
                  onClick: createNewDevice,
                  href: '/settings/devices/new',
                },
              ]}
            />
          </Section>
        : <Flexbox alignItems="center">
            <Title style={{flex: 1}}>Devices</Title>
            <IconButton icon="add" onClick={createNewDevice} />
          </Flexbox>
    }
  />

export const DeviceSettings = enhance(
  DeviceSettingsView,
) as React.ComponentClass<DeviceSettingsProps>
