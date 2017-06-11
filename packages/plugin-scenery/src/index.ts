import {Call, Device, Modification, Plugin} from 'raxa-common'

export interface Scenery extends Device {
  config: {
    modifications: Array<Modification>
    [field: string]: any
  }
}

export default class SceneryPlugin extends Plugin {
  onDeviceCalled(_: Call, device: Scenery) {
    this.log.debug('Setting scenery', device.name)

    return Promise.all(
      device.config.modifications.map(this.setDeviceStatus),
    ).then(() => {})
  }
}
