import {StorageService} from '../server/storage'
import {PluginSupervisor} from '../server/plugin-supervisor'

export type Context = {
  storage: StorageService,
  plugins: PluginSupervisor,
}
