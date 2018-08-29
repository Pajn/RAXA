import {Runtime} from '@pajn/control-flow/cjs/runtime/entities'
import {createRuntime} from '@pajn/control-flow/cjs/runtime/runtime'
import {Graph} from '@pajn/control-flow/cjs/schematic-core/entities'
import ApolloClient from 'apollo-boost'
import {graphqlHapi} from 'apollo-server-hapi'
import Boom from 'boom'
import gql from 'graphql-tag'
import {IResolverObject, IResolvers, makeExecutableSchema} from 'graphql-tools'
import GraphQLJSON from 'graphql-type-json'
import * as Hapi from 'hapi'
import {Request, ResponseToolkit} from 'hapi'
import inert from 'inert'
import fetch from 'isomorphic-fetch'
import * as Joi from 'joi'
import nodeFetch from 'node-fetch'
import {join} from 'path'
import {Modification, Plugin, actions} from 'raxa-common'
import {Actions} from 'raxa-common/lib/plugin'
import {getNodeImplementations} from './nodeImplementations'
import {getNodeTypes} from './nodeTypes'
import plugin from './plugin'

const typeDefs = gql`
  scalar JSON

  type Program {
    id: String
    name: String
    graph: JSON
  }

  input ProgramInput {
    id: String
    name: String
    graph: JSON
  }

  type Query {
    program(id: String!): Program
    programs: [Program!]
  }

  type Mutation {
    saveProgram(program: ProgramInput!): Program
  }
`

type Context = {}
type Program = {
  id: string
  name: string
  graph: Graph
}

type Settings = {
  programs: Record<string, Program>
}

export default class ControlFlowPlugin extends Plugin {
  deviceStatusListeners = new Set<(modification: Modification) => void>()
  runtimes = new Map<string, Runtime>()
  server: Hapi.Server | undefined

  getSettings = () =>
    (this.state.getState().plugins[plugin.id].settings || {
      programs: {},
    }) as Settings
  setSettings = (settings: Settings) =>
    this.dispatch(actions.pluginUpdated, {plugin: {id: plugin.id, settings}})

  async start() {
    const server = new Hapi.Server({
      port: 13001,
      debug: {
        log: ['*'],
        request: ['*'],
      },
      routes: {
        files: {
          relativeTo: join(__dirname, '../ui/build'),
        },
      },
    })

    const raxaClient = new ApolloClient({
      uri: 'http://localhost:9000/graphql',
      fetchOptions: {fetch},
    })
    const nodeTypes = getNodeTypes(raxaClient)
    const {nodeImplementations, httpReceive} = getNodeImplementations(
      raxaClient,
    )

    Object.values(this.getSettings().programs).forEach(program => {
      const runtime = createRuntime({
        program: {
          graph: program.graph,
          nodeTypes,
        },
        implementations: nodeImplementations(this),
      })
      runtime.start()
      this.runtimes.set(program.id, runtime)
    })

    const resolvers: IResolvers<undefined, Context> = {
      Query: {
        program: (_, {id}) => this.getSettings().programs[id],
        programs: () => this.getSettings().programs,
      },
      Mutation: {
        saveProgram: (_, {program}: {program: Program}) => {
          if (!program.id) {
            program.id = Date.now().toString()
          }
          this.setSettings({
            programs: {...this.getSettings().programs, [program.id]: program},
          })

          const runtime = this.runtimes.get(program.id)
          if (runtime) {
            runtime.updateProgram({
              graph: this.getSettings().programs[1].graph,
              nodeTypes,
            })
          } else {
            const runtime = createRuntime({
              program: {
                graph: program.graph,
                nodeTypes,
              },
              implementations: nodeImplementations(this),
            })
            runtime.start()
            this.runtimes.set(program.id, runtime)
          }

          return program
        },
      } as IResolverObject<undefined, Context>,
    }

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    })
    Object.assign((schema as any)._typeMap.JSON, GraphQLJSON)

    await server.register({
      plugin: graphqlHapi as any,
      options: {
        path: '/graphql',
        graphqlOptions: {
          schema,
        },
        route: {
          cors: true,
        },
      },
    })

    server.route({
      method: '*',
      path: '/raxagraphql',
      async handler(request: Request, h: ResponseToolkit) {
        const response = await nodeFetch(
          `http://127.0.0.1:9000/graphql${request.url.search}`,
          {
            method: request.method.toUpperCase(),
            headers: request.headers,
            body: request.payload as any,
            redirect: 'manual',
          },
        )
        const responseObj = h
          .response(await response.buffer())
          .code(response.status)
        response.headers.forEach((value, key) => {
          if (
            !['content-length', 'content-encoding', 'accept-ranges'].includes(
              key,
            )
          ) {
            responseObj.header(key, value)
          }
        })
        return responseObj
      },
      options: {
        cors: true,
        payload: {
          output: 'data',
          parse: false,
        },
      },
    })

    await server.register(inert as any)

    server.route({
      method: ['GET', 'POST'],
      path: '/variable/{name}',
      handler: (request, h) => {
        const didExist = httpReceive(
          request.params.name,
          (request.query as any).value,
        )

        return didExist
          ? h.response('ok').code(200)
          : h.response('missing variable').code(400)
      },
      options: {
        validate: {
          query: {
            value: Joi.string().required(),
          },
        },
      },
    })

    server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: join(__dirname, '../ui/build'),
          index: true,
          lookupCompressed: true,
        },
      },
    })

    // return index.html for everything else
    server.ext('onPreResponse', (request, h) => {
      const response = request.response as Boom
      if (response && response.isBoom && response.output!.statusCode === 404) {
        return (h as any).file(join(__dirname, '../ui/build/index.html'), {
          confine: false,
        })
      }

      return h.continue
    })

    await server.start()
    this.server = server

    console.log(`CF Server running at: ${server.info.uri}`)
  }

  async stop() {
    if (this.server) {
      await this.server.stop()
    }
  }

  onAction(action: Actions) {
    if (action.type === 'statusUpdated') {
      for (const listener of this.deviceStatusListeners) {
        listener(action.payload!)
      }
    }
  }
}
