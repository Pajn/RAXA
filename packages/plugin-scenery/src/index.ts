import {Action, Call, Device, Plugin, actions} from 'raxa-common'
import plugin from './plugin'

export interface Scenery extends Device {
  config: {
    modifications: Array<Action>
    [field: string]: any
  }
}

export default class SceneryPlugin extends Plugin {
  start() {
    Object.values(this.state.getState().devices).forEach(device => {
      if (device.pluginId === plugin.id) {
        const modifications = (device as Scenery).config.modifications
        if (
          modifications.some(modification => modification.type === undefined)
        ) {
          this.dispatch(actions.deviceUpdated, {
            device: {
              ...device,
              config: {
                ...device.config,
                modifications: modifications.map(modification => ({
                  type: 'modification',
                  ...modification,
                })),
              },
            },
          })
        }
      }
    })
  }

  onDeviceCalled(_: Call, device: Scenery) {
    this.log.debug('Setting scenery', device.name)

    return Promise.all(
      device.config.modifications.map(
        action =>
          action.type === 'modification'
            ? this.setDeviceStatus(action)
            : this.callDevice(action),
      ),
    ).then(() => {})
  }
}
