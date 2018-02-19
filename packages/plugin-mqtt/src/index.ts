import {Server} from 'mosca'
import {Plugin} from 'raxa-common'
import plugin from './plugin'

export default class MqttPlugin extends Plugin {
  server: any

  async start() {
    const server = new Server({
      port: 1883,
    })
    this.server = server

    this.listenOn(
      plugin.interfaces.MQTT.id,
      plugin.interfaces.MQTT.events.publish.id,
      ({
        clientId,
        topic,
        value,
      }: {
        clientId: string
        topic: string
        value: string
      }) => {
        this.log.debug('Publishing packet', {
          clientId,
          topic,
          payload: value,
          qos: 0,
          retain: false,
        })
        server.publish({
          topic,
          payload: value,
          qos: 0,
          retain: false,
          ...(clientId && {clientId}),
        })
      },
    )

    server.on('published', (packet, client) => {
      this.log.debug('Received packet', {
        clientId: client && client.id,
        topic: packet.topic,
        value: packet.payload.toString(),
      })
      this.fireEvent(
        plugin.interfaces.MQTT.id,
        plugin.interfaces.MQTT.events.received.id,
        {
          clientId: client && client.id,
          topic: packet.topic,
          value: packet.payload.toString(),
        },
      )
    })
  }

  async stop() {
    return new Promise(resolve => {
      this.server.close(resolve)
    })
  }
}
