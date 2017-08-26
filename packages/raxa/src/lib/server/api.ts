import {execute} from 'graphql'
import {graphiqlHapi, graphqlHapi} from 'graphql-server-hapi'
import {subscribe} from 'graphql/subscription'
import {Server} from 'hapi'
import {createServer} from 'http'
import {Service} from 'raxa-common/cjs'
import {SubscriptionServer} from 'subscriptions-transport-ws'
import {Context} from '../graphql/context'
import {schema} from '../graphql/schema'
import {PluginSupervisor} from './plugin-supervisor'
import {StorageService} from './storage'

export function register(server, options) {
  return new Promise((resolve, reject) => {
    server.register(options, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

export class ApiService extends Service {
  async start() {
    const httpServer = createServer()
    const server = new Server()
    const storage = this.serviceManager.runningServices
      .StorageService as StorageService
    const plugins = this.serviceManager.runningServices
      .PluginSupervisor as PluginSupervisor
    const context: Context = {storage, plugins}

    server.connection({listener: httpServer, port: 9000, routes: {cors: true}})

    await register(server, {
      register: graphqlHapi,
      options: {
        path: '/graphql',
        graphqlOptions: {schema, context},
        subscriptionsEndpoint: `ws://localhost:9000/subscriptions`,
      },
    })

    await register(server, {
      register: graphiqlHapi,
      options: {
        path: '/graphiql',
        graphiqlOptions: {
          endpointURL: '/graphql',
          subscriptionsEndpoint: `ws://localhost:9000/subscriptions`,
        },
      },
    })

    return new Promise((resolve, reject) => {
      server.start(err => {
        if (err) return reject(err)

        SubscriptionServer.create(
          {
            execute,
            subscribe,
            schema,
            onConnect: () => context,
          },
          {
            server: httpServer,
            path: '/subscriptions',
          },
        )

        resolve(server)
      })
    })
  }
}
