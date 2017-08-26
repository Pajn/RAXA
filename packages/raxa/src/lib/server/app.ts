import {ServiceManager} from 'raxa-common/cjs'
import {production} from '../config'
import {ApiService} from './api'
import {PluginSupervisor} from './plugin-supervisor'
import {StorageService} from './storage'
import {WebService} from './web'

export async function main() {
  const serviceManager = new ServiceManager()

  await serviceManager.startServices(
    StorageService,
    PluginSupervisor,
    ApiService,
    production && WebService,
  )

  let firstInt = true
  process.on('SIGINT', () => {
    if (firstInt) {
      console.log(
        '\n\nStopping services gracefully, press ctrl+c again to force quit\n',
      )
      firstInt = false
      serviceManager.stopServices()
    } else {
      process.exit(1)
    }
  })
}
