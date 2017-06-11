import React from 'react'
import styled from 'styled-components'
import {Grid} from '../../grid/grid'
import {ContextActions} from '../ui/scaffold/context-actions'
import {Widget} from './widget'
import {DisplayWidget} from './widgets/display'
import {LightWidget} from './widgets/light'

const Container = styled(Grid)`
  flex: 1;
`

export const Dashboard = () =>
  <Container cols={10} rows={10} gap="16px">
    <ContextActions
      contextActions={[
        {label: 'Settings', href: '/settings', icon: 'settings'},
      ]}
    />
    <Widget x={0} y={0} width={3} height={1}>
      <DisplayWidget
        config={{
          deviceId: '1490980661126',
          interfaceId: 'Temperature',
          statusId: 'temp',
        }}
      />
    </Widget>
    <Widget x={5} y={0} width={3} height={1}>
      <LightWidget
        config={{
          deviceId: '1490977902528',
        }}
      />
    </Widget>
    <Widget x={5} y={1} width={3} height={2}>
      <LightWidget
        config={{
          deviceId: '1490977902528',
        }}
      />
    </Widget>
    <Widget x={5} y={3} width={5} height={1}>
      <LightWidget
        config={{
          deviceId: '1490977902528',
        }}
      />
    </Widget>
  </Container>
