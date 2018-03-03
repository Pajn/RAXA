import {pathExists, readFile} from 'fs-extra'
import {Server as HttpServer, createServer} from 'http'
import {Awaitable} from 'iterates/cjs/async'
import {Service} from 'raxa-common/cjs'
import {promisify} from 'util'
import {sslCert, sslKey} from '../config'

export class HttpService extends Service {
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
    if (hasCert) {
      this.log.info('Starting HTTPS server')
      const httpsServer = require('https').createServer({
        cert: await readFile(sslCert!, 'utf-8'),
        key: await readFile(sslKey!, 'utf-8'),
      })
      this.httpsServer = httpsServer
    } else {
      this.log.info('No cert found, skipping HTTPS server')
    }

    await promisify(httpServer.listen).call(httpServer, 9000)
    if (this.httpsServer) {
      await promisify(this.httpsServer.listen).call(this.httpsServer, 9001)
    }
  }

  async stop() {
    await promisify(this.httpServer.close).call(this.httpServer)
    if (this.httpsServer) {
      await promisify(this.httpsServer.close).call(this.httpsServer)
    }
  }

  public async registerListener(
    registrator: (server: HttpServer) => Awaitable<void>,
  ) {
    await registrator(this.httpServer)
    if (this.httpsServer) {
      await registrator(this.httpsServer)
    }
  }
}
