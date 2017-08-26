import {Server} from 'hapi'
import inert from 'inert'
import {Service} from 'raxa-common/cjs'
import {register} from './api'

export class WebService extends Service {
  async start() {
    const server = new Server()

    await register(server, inert)

    server.connection({port: 8000, routes: {cors: true}})
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

        resolve(server)
      })
    })
  }
}
