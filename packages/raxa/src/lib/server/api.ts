import {pathExists, readFile} from 'fs-extra'
import {execute} from 'graphql'
import {graphiqlHapi, graphqlHapi} from 'graphql-server-hapi'
import {subscribe} from 'graphql/subscription'
import {Server} from 'hapi'
import {Server as HttpServer, createServer} from 'http'
import fetch from 'node-fetch'
import {Service} from 'raxa-common/cjs'
import {SubscriptionServer} from 'subscriptions-transport-ws'
import {sslCert, sslKey} from '../config'
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
  server: Server
  httpServer: HttpServer
  httpsServer: HttpServer | undefined

  async start() {
    const hasCert =
      sslCert &&
      sslKey &&
      (await pathExists(sslCert!)) &&
      (await pathExists(sslKey!))
    const httpServer = createServer()
    this.httpServer = httpServer
    let httpsServer: HttpServer | undefined
    if (hasCert) {
      this.log.info('Starting HTTPS server')
      httpsServer = require('https').createServer({
        cert: await readFile(sslCert!, 'utf-8'),
        key: await readFile(sslKey!, 'utf-8'),
      })
      this.httpsServer = httpsServer
    } else {
      this.log.info('No cert found, skipping HTTPS server')
    }
    const server = new Server({debug: {request: ['error']}})
    const storage = this.serviceManager.runningServices
      .StorageService as StorageService
    const plugins = this.serviceManager.runningServices
      .PluginSupervisor as PluginSupervisor
    const context: Context = {storage, plugins}

    server.connection({listener: httpServer, port: 9000, routes: {cors: true}})
    if (httpsServer) {
      server.connection({
        listener: httpsServer,
        port: 9001,
        routes: {cors: true},
      })
    }

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

    server.on('response', request => {
      this.log.debug(
        request.info.remoteAddress +
          ': ' +
          request.method.toUpperCase() +
          ' ' +
          request.url.path +
          ' --> ' +
          request.response!.statusCode,
      )
    })

    server.route({
      method: '*',
      path: '/plugin/{pluginId}/{path*}',
      handler: async (request, reply) => {
        const {pluginId, path} = request.params
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
              redirect: 'manual',
            },
          )
          const responseObj = reply(null, response.buffer()).code(
            response.status,
          )
          response.headers.forEach((value, key) => {
            responseObj.header(key, value)
          })
        } else {
          reply({
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found',
          }).code(404)
        }
      },
    })

    return new Promise((resolve, reject) => {
      server.start(err => {
        if (err) return reject(err)
        this.server = server

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
        if (httpsServer) {
          SubscriptionServer.create(
            {
              execute,
              subscribe,
              schema,
              onConnect: () => context,
            },
            {
              server: httpsServer,
              path: '/subscriptions',
            },
          )
        }

        resolve(server)
      })
    })
  }

  async stop() {
    if (this.server) {
      this.server.stop()
    }
    if (this.httpServer) {
      this.httpServer.close()
    }
    if (this.httpsServer) {
      this.httpsServer.close()
    }
  }
}
