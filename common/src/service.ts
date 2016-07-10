import {EventEmitter2} from 'eventemitter2'
import {Action} from 'redux-decorated'
import {Awaitable} from './entities'
import {Log} from './log'
import {State} from './state'

export abstract class Service {
  eventEmitter: EventEmitter2.emitter
  log: Log

  dispatch: <P>(action: Action<P>, payload: P) => void
  getState: () => State

  /**
   * Called when the service is stared, either becuse of beeing activated or when RAXA
   * is starting. If a Promise is returned then RAXA will wait for it to be resolved.
   */
  start(): Awaitable<any> {/* empty */}

  /**
   * Called when the service is stopped, either becuse of beeing deactivated or when RAXA
   * is stopping. If a Promise is returned then RAXA will wait for it to be resolved.
   */
  stop(): Awaitable<any> {/* empty */}
}

export interface ServiceImplementation {
  new(): Service
}

export class ServiceManager {
  log: Log
  runningServices: {[name: string]: Service} = {}
  startOrder = []

  constructor(private rootLogger?) {
    this.log = new Log('ServiceManager', rootLogger)
  }

  /**
   * Starts all passed services
   */
  async startServices(...services: Array<ServiceImplementation>) {
    for (const service of services) {
      await this.startService(service)
    }
  }

  async startService(service: ServiceImplementation) {
    const {name} = service
    this.log.info(`Starting service ${name}`)
    const serviceInstance = new service()
    serviceInstance.log = new Log(name, this.rootLogger)
    await serviceInstance.start()
    this.startOrder.push(name)
    this.runningServices[service.name] = serviceInstance
    this.log.info(`Started service ${name}`)
  }

  /**
   * Stops all services in the reverse order of how they started
   */
  async stopServices() {
    for (const name of this.startOrder.reverse()) {
      await this.stopService(name)
    }
  }

  async stopService(name: string) {
    this.log.info(`Stopping service ${name}`)
    const service = this.runningServices[name]
    if (!service) {
      return this.log.warn(`Service ${name} is not running`)
    }
    if (service.stop) {
      await service.stop()
    }
    this.startOrder = this.startOrder.filter(n => n !== name)
    delete this.runningServices[name]
    this.log.info(`Stopped service ${name}`)
  }
}
