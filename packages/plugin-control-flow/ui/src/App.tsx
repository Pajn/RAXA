import {Editor} from '@pajn/control-flow/lib/board/components/editor'
import {deleteSelectedNodes} from '@pajn/control-flow/lib/board/lib/actions/nodes'
import {
  EditorState,
  editorReducer,
} from '@pajn/control-flow/lib/board/lib/state/editor'
import {loadProgram} from '@pajn/control-flow/lib/board/lib/state/program'
import {ContextMenuProvider} from '@pajn/control-flow/lib/ui/components/context_menu'
import ApolloClient from 'apollo-boost'
import {gql} from 'apollo-boost'
import {getNodeTypes} from 'raxa-plugin-control-flow/lib/nodeTypes'
import React from 'react'
import {ApolloProvider, Query} from 'react-apollo'
import {HotKeys} from 'react-hotkeys'
import {Provider, Store} from 'react-redux'
import {applyMiddleware, compose, createStore} from 'redux'
import thunk from 'redux-thunk'

const apiRoot =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:13001`
    : `${window.location.toString().replace(/\/$/, '')}`

const controlFlowClient = new ApolloClient({
  uri: `${apiRoot}/graphql`,
})

const raxaClient = new ApolloClient({
  uri: `${apiRoot}/raxagraphql`,
  fetchOptions: {fetch},
})
const nodeTypes = getNodeTypes(raxaClient as any)

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
  }
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  editorReducer,
  composeEnhancers(applyMiddleware(thunk)),
) as Store<EditorState>

const keyMap = {
  save: ['ctrl+s', 'command+s'],
  delete: 'del',
}

const getProgramQuery = gql`
  query($id: String!) {
    program(id: $id) {
      id
      name
      graph
    }
  }
`

controlFlowClient
  .query<any>({query: getProgramQuery, variables: {id: '1'}})
  .then(({data}) => {
    store.dispatch(
      loadProgram({
        graph: (data.program || {graph: {nodes: {}, connections: {}}}).graph,
        nodeTypes,
      }),
    )
  })

export const App = () => (
  <ApolloProvider client={controlFlowClient}>
    <Provider store={store}>
      <Query query={getProgramQuery} variables={{id: '1'}}>
        {({loading}) =>
          !loading && (
            <ContextMenuProvider style={{width: '100%', height: '100%'}}>
              <HotKeys
                {...{style: {width: '100%', height: '100%'}} as any}
                keyMap={keyMap}
                handlers={{
                  delete: () => store.dispatch(deleteSelectedNodes()),
                  save: (e: KeyboardEvent) => {
                    e.preventDefault()
                    controlFlowClient.mutate({
                      mutation: gql`
                        mutation($program: ProgramInput!) {
                          saveProgram(program: $program) {
                            id
                          }
                        }
                      `,
                      variables: {
                        program: {
                          id: '1',
                          name: 'test',
                          graph: store.getState().program.graph,
                        },
                      },
                    })
                  },
                }}
              >
                <Editor nodeTypes={nodeTypes} />
              </HotKeys>
            </ContextMenuProvider>
          )
        }
      </Query>
    </Provider>
  </ApolloProvider>
)
