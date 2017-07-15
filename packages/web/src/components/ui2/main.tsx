import glamorous from 'glamorous'
import {grey} from 'material-definitions'
import * as React from 'react'
import {ListSubHeader} from 'react-toolbox/lib/list'
import {ListWidget} from '../dashboard/widgets/list'
import {ContextActions} from '../ui/scaffold/context-actions'

const Ui2Container = glamorous.div({
  paddingTop: 8,
  height: '100%',
  backgroundColor: grey[50],
})

export const Ui2 = () =>
  <Ui2Container>
    <ContextActions contextActions={[{href: '/settings', icon: 'settings'}]} />
    <ListSubHeader caption="Scenes" />
    <ListWidget config={{interfaceIds: ['Scenery']}} />
    <ListSubHeader caption="Lighting" />
    <ListWidget column config={{interfaceIds: ['Power', 'Dimmer']}} />
    <ListSubHeader caption="Temperature" />
    <ListWidget column config={{interfaceIds: ['Temperature']}} />
  </Ui2Container>
