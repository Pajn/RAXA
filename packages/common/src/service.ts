import {Action} from 'redux-decorated'
import {Awaitable} from './entities'
import {Log} from './log'
import {State} from './state'

export type Scope = string | number | ScopeObject | ScopeArray
export type ScopeObject = {[x: string]: Scope}
export interface ScopeArray extends Array<Scope> {}

export interface Options {
  where: any
}

export interface S<T> {
  getState: () => T
  scalar(scope: Scope, options?: Options): any
  list(scope: Scope, options?: Options): Array<any>
}

function selectScope(scope: Scope, state: any) {
  if (typeof scope === 'string' || typeof scope === 'number') {
    return state && state[scope]
  } else if (Array.isArray(scope)) {
    throw Error('array scope not impelemented')
  } else {
    const keys = Object.keys(scope)
    if (keys.length === 1) {
      const subState = selectScope(keys[0], state)
      return selectScope(scope[keys[0]], subState)
    } else {
      throw Error('object array scope not impelemented')
    }
  }
}

function compareProps(element, where, whereProps) {
  if (!element) return false
  return whereProps.every(prop => {
    if (where[prop] && typeof where[prop] === 'object') {
      return compareProps(element[prop], where[prop], Object.keys(where[prop]))
    }
    return element[prop] === where[prop]
  })
}

function filterList(list: Array<any>, options?: Options) {
  if (!options) return list
  if (options.where) {
    const properties = Object.keys(options.where)
    list = list.filter(element =>
      compareProps(element, options.where, properties),
    )
  }
  return list
}

export class StateQuery<T> implements S<T> {
  constructor(private storage) {}

  getState() {
    return this.storage.getState()
  }

  scalar(scope: Scope, options?: Options): any {
    return this.list(scope, options)[0]
  }

  list(scope: Scope, options?: Options): Array<any> {
    const selectedData = selectScope(scope, this.storage.getState())
    if (!selectedData) return []
    if (Array.isArray(selectedData)) return filterList(selectedData, options)
    return filterList(Object.values(selectedData), options)
  }
}

export abstract class Service {
  log: Log
  serviceManager: ServiceManager

  dispatch: <P>(action: Action<P>, payload: P) => void
  state: S<State>

  /**
   * Called when the service is stared, either becuse of beeing activated or when RAXA
   * is starting. If a Promise is returned then RAXA will wait for it to be resolved.
   */
  start(): Awaitable<any> {
    /* empty */
  }

  /**
   * Called when the service is stopped, either becuse of beeing deactivated or when RAXA
   * is stopping. If a Promise is returned then RAXA will wait for it to be resolved.
   */
  stop(): Awaitable<any> {
    /* empty */
  }
}

export interface ServiceImplementation {
  new (): Service
  serviceName?: string
}

export class ServiceManager {
  log: Log
  runningServices: {[name: string]: Service} = {}
  startOrder: Array<string> = []

  constructor(private rootLogger?) {
    this.log = new Log('ServiceManager', rootLogger)
  }

  /**
   * Starts all passed services
   */
  async startServices(
    ...services: Array<ServiceImplementation | false | undefined | null>
  ) {
    for (const service of services) {
      if (service) {
        await this.startService(service)
      }
    }
  }

  async startService(service: ServiceImplementation) {
    const name = service.serviceName || service.name
    this.log.info(`Starting service ${name}`)
    const serviceInstance = new service()
    this.configureService(service, serviceInstance)
    await serviceInstance.start()
    this.startOrder.push(name)
    this.runningServices[name] = serviceInstance
    this.log.info(`Started service ${name}`)
    return serviceInstance
  }

  protected configureService(
    service: ServiceImplementation,
    serviceInstance: Service,
  ) {
    serviceInstance.log = new Log(service.name, this.rootLogger)
    serviceInstance.serviceManager = this
    const storage = this.runningServices.StorageService
    if (storage) {
      serviceInstance.state = new StateQuery<State>(storage)
      serviceInstance.dispatch = storage.dispatch
    }
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
