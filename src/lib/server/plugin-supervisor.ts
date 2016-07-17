import {ServiceManager, Plugin, Service} from 'raxa-common'

export class PluginSupervisor extends Service {
  private runningPlugins: {[name: string]: Plugin} = {}
  private serviceManager = new ServiceManager(this.log)

  async start() {
    await ['mysensors'].map(this.startPlugin.bind(this))
  }

  async stop() {
    for (const plugin of Object.values(this.runningPlugins)) {
      await plugin.stop()
    }
  }

  private async startPlugin(name: string) {
    this.log.info(`Starting plugin ${name}`)
    let plugin = require(`raxa-plugin-${name}`)
    if (plugin.default) {
      plugin = plugin.default
    }

    if (typeof plugin !== 'function') {
      this.log.warn(`Plugin ${name} has no default exported class`)
    }

    await this.serviceManager.startService(plugin)
  }
}
