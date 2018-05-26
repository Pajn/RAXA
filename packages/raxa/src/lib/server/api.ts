import {execute} from 'graphql'
import {graphiqlHapi, graphqlHapi} from 'graphql-server-hapi'
import {subscribe} from 'graphql/subscription'
import {
  Request,
  ResponseObject,
  ResponseToolkit,
  Server,
  ServerRegisterPluginObject,
} from 'hapi'
import fetch from 'node-fetch'
import {Awaitable, Service} from 'raxa-common/cjs'
import {SubscriptionServer} from 'subscriptions-transport-ws'
import {Context} from '../graphql/context'
import {schema} from '../graphql/schema'
import {HttpService} from './http'
import {PluginManager} from './plugin-manager'
import {PluginSupervisor} from './plugin-supervisor'
import {StorageService} from './storage'

export class ApiService extends Service {
  hapiServers: Array<Server> = []

  async start() {
    const http = this.serviceManager.runningServices.HttpService as HttpService
    await http.registerListener(async httpServer => {
      const server = new Server({
        listener: httpServer,
        autoListen: false,
        routes: {cors: {origin: ['*']}},
        debug: {request: ['error']},
      })
      const storage = this.serviceManager.runningServices
        .StorageService as StorageService
      const pluginManager = this.serviceManager.runningServices
        .PluginManager as PluginManager
      const pluginSupervisor = this.serviceManager.runningServices
        .PluginSupervisor as PluginSupervisor
      const context: Context = {storage, pluginManager, pluginSupervisor}

      await server.register({
        plugin: graphqlHapi,
        options: {
          path: '/graphql',
          graphqlOptions: {
            schema,
            context,
          },
          subscriptionsEndpoint: `ws://localhost:9000/subscriptions`,
        },
      } as ServerRegisterPluginObject<any>)

      await server.register({
        plugin: graphiqlHapi,
        options: {
          path: '/graphiql',
          graphiqlOptions: {
            endpointURL: '/graphql',
            subscriptionsEndpoint: `ws://localhost:9000/subscriptions`,
          },
        },
      } as ServerRegisterPluginObject<any>)

      server.events.on('request', (_, event) => {
        if (event.error) {
          this.log.error('Request error', event.error)
        }
      })
      server.events.on('log', event => {
        if (event.error) {
          this.log.error('Request error', event.error)
        }
      })
      server.events.on('response', request => {
        this.log.debug(
          request.info.remoteAddress +
            ': ' +
            request.method.toUpperCase() +
            ' ' +
            request.url.path +
            ' --> ' +
            (request.response as ResponseObject)!.statusCode,
        )
      })

      async function pluginForwardHandler(
        request: Request,
        h: ResponseToolkit,
      ) {
        const {pluginId, path = ''} = request.params
        const pluginDefinition = storage.getState().plugins[pluginId]
        if (
          pluginSupervisor.isRunning(pluginId) &&
          pluginDefinition.httpForwarding !== undefined
        ) {
          const {port, basePath = ''} = pluginDefinition.httpForwarding
          const response = await fetch(
            `http://127.0.0.1:${port}${basePath}/${path}${request.url.search}`,
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
        } else {
          return h
            .response({
              statusCode: 404,
              error: 'Not Found',
              message: 'Not Found',
            })
            .code(404)
        }
      }

      server.route({
        method: '*',
        path: '/plugin/{pluginId}/{path*}',
        handler: pluginForwardHandler,
        options: {
          payload: {
            output: 'data',
            parse: false,
          },
        },
      })

      server.route({
        method: 'GET',
        path: '/plugin/{pluginId}/{path*}',
        handler: pluginForwardHandler,
      })

      await server.start()
      this.hapiServers.push(server)

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
    })
  }

  public async registerListener(
    registrator: (server: Server) => Awaitable<void>,
  ) {
    for (const server of this.hapiServers) {
      await registrator(server)
    }
  }
}
