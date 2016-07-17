import {ServiceManager} from 'raxa-common'
import {ApiService} from './api'
import {PluginSupervisor} from './plugin-supervisor'

export async function main() {
  const serviceManager = new ServiceManager()

  await serviceManager.startServices(ApiService, PluginSupervisor)

  let firstInt = true
  process.on('SIGINT', () => {
    if (firstInt) {
      console.log('\n\nStopping services gracefully, press ctrl+c again to force quit\n')
      firstInt = false
      serviceManager.stopServices()
    } else {
      process.exit(1)
    }
  })
}
