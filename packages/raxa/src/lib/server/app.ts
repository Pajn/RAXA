import {ServiceManager, defaultInterfaces} from 'raxa-common/cjs'
import {production} from '../config'
import {ApiService} from './api'
import {HttpService} from './http'
import {PluginManager, ProductionPluginManager} from './plugin-manager'
import {PluginSupervisor} from './plugin-supervisor'
import {StorageService} from './storage'
import {WebService} from './web'

export async function main() {
  const serviceManager = new ServiceManager()

  await serviceManager.startServices(
    StorageService,
    production ? ProductionPluginManager : PluginManager,
    PluginSupervisor,
    HttpService,
    ApiService,
    production && WebService,
  )

  function registerSignalListener(signal: NodeJS.Signals) {
    let firstInt = true
    process.on(signal, () => {
      if (firstInt) {
        console.log(
          '\n\nStopping services gracefully, press ctrl+c again to force quit\n',
        )
        firstInt = false
        serviceManager.stopServices().then(() => process.exit(0))
      } else {
        process.exit(1)
      }
    })
  }
  registerSignalListener('SIGINT')
  registerSignalListener('SIGHUP')
}

export async function installDefaults() {
  console.log('Installing default interfaces and plugins')

  const serviceManager = new ServiceManager()

  await serviceManager.startServices(
    StorageService,
    production ? ProductionPluginManager : PluginManager,
  )

  const storage = serviceManager.runningServices
    .StorageService as StorageService
  const pluginManager = serviceManager.runningServices
    .PluginManager as PluginManager

  Object.values(defaultInterfaces).forEach(iface => {
    storage.installInterface(iface)
  })

  for (const pluginId of ['mqtt', 'scenery', 'timer', 'trigger']) {
    await pluginManager.installPlugin(pluginId)
  }

  await pluginManager.stop()
  await storage.stop()
  process.exit(0)
}
