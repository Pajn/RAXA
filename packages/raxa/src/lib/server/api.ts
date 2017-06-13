import {graphiqlHapi, graphqlHapi} from 'graphql-server-hapi'
import {Server} from 'hapi'
import {Service} from 'raxa-common'
import {Context} from '../graphql/context'
import {schema} from '../graphql/schema'
import {PluginSupervisor} from './plugin-supervisor'
import {StorageService} from './storage'

function register(server, options) {
  return new Promise((resolve, reject) => {
    server.register(options, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

export class ApiService extends Service {
  async start() {
    const server = new Server()
    const storage = this.serviceManager.runningServices
      .StorageService as StorageService
    const plugins = this.serviceManager.runningServices
      .PluginSupervisor as PluginSupervisor
    const context: Context = {storage, plugins}

    server.connection({port: 9000, routes: {cors: true}})

    await register(server, {
      register: graphqlHapi,
      options: {
        path: '/graphql',
        graphqlOptions: {schema, context},
      },
    })

    await register(server, {
      register: graphiqlHapi,
      options: {
        path: '/graphiql',
        graphiqlOptions: {
          endpointURL: '/graphql',
        },
      },
    })

    return new Promise((resolve, reject) => {
      server.start(err => {
        if (err) return reject(err)
        resolve(server)
      })
    })
  }
}
