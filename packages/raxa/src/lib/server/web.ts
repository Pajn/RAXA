import {Server} from 'hapi'
import inert from 'inert'
import {Service} from 'raxa-common/cjs'
import {ApiService} from './api'

export class WebService extends Service {
  hapiServers: Array<Server> = []

  async start() {
    const api = this.serviceManager.runningServices.ApiService as ApiService
    await api.registerListener(async server => {
      await server.register(inert)

      server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: '/app/web/build',
            index: true,
            lookupCompressed: true,
          },
        },
      })

      // return index.html for everything else
      server.ext('onPreResponse', (request, h) => {
        const response = request.response
        if (response.isBoom && response.output!.statusCode === 404) {
          return h.file('/app/web/build/index.html')
        }

        return h.continue
      })

      await server.start()
      this.hapiServers.push(server)
    })
  }
}
