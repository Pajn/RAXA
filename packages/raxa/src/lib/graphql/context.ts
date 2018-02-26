import {PluginManager} from '../server/plugin-manager'
import {PluginSupervisor} from '../server/plugin-supervisor'
import {StorageService} from '../server/storage'

export type Context = {
  storage: StorageService
  pluginManager: PluginManager
  pluginSupervisor: PluginSupervisor
}
