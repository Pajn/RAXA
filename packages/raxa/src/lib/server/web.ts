import {pathExists, readFile} from 'fs-extra'
import {Server} from 'hapi'
import {Server as HttpServer} from 'http'
import inert from 'inert'
import {Service} from 'raxa-common/cjs'
import {sslCert, sslKey} from '../config'
import {register} from './api'

export class WebService extends Service {
  server: Server
  httpsServer: HttpServer | undefined

  async start() {
    const hasCert =
      sslCert &&
      sslKey &&
      (await pathExists(sslCert!)) &&
      (await pathExists(sslKey!))
    const server = new Server()

    await register(server, inert)

    server.connection({port: 8000, routes: {cors: true}})

    if (hasCert) {
      const httpsServer = require('https').createServer({
        cert: await readFile(sslCert!, 'utf-8'),
        key: await readFile(sslKey!, 'utf-8'),
      })
      this.httpsServer = httpsServer
      server.connection({
        listener: httpsServer,
        port: 8001,
        routes: {cors: true},
      })
    }

    server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: '/app/packages/web/build',
          index: true,
          lookupCompressed: true,
        },
      },
    })

    // return index.html for everything else
    server.ext('onPostHandler', (request, reply) => {
      const response = request.response!
      if (response.isBoom && response.output!.statusCode === 404) {
        return (reply as any).file('/app/packages/web/build/index.html')
      }
      return reply.continue()
    })

    return new Promise((resolve, reject) => {
      server.start(err => {
        if (err) return reject(err)
        this.server = server

        resolve(server)
      })
    })
  }

  async stop() {
    if (this.server) {
      this.server.stop()
    }
    if (this.httpsServer) {
      this.httpsServer.close()
    }
  }
}
