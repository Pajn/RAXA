import {ServiceManager} from 'raxa-common/cjs'
import {ApiService} from './api'
import {PluginSupervisor} from './plugin-supervisor'
import {StorageService} from './storage'

export async function main() {
  const serviceManager = new ServiceManager()

  await serviceManager.startServices(
    StorageService,
    PluginSupervisor,
    ApiService,
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