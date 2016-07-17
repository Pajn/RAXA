import {Server} from 'hapi'
import {register as nes} from 'nes'
import {Service} from 'raxa-common'

export class ApiService extends Service {
  start() {
    const server = new Server()

    server.connection({port: 9000})

    return new Promise((resolve, reject) => {
      server.register(nes, err => {
        if (err) return reject(err)
        // server.subscription('/item/{id}')

        server.start(err => {
          if (err) return reject(err)

          resolve(server)
          // server.publish('/item/5', {id: 5, status: 'complete'})
          // server.publish('/item/6', {id: 6, status: 'initial'})
        })
      })
    })
  }
}
