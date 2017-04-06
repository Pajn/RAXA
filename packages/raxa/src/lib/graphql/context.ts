import {PluginSupervisor} from '../server/plugin-supervisor'
import {StorageService} from '../server/storage'

export type Context = {
  storage: StorageService,
  plugins: PluginSupervisor,
}
