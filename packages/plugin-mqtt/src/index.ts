import createMqttBroker from 'aedes'
import {IPublishPacket} from 'mqtt-packet'
import {Server, createServer} from 'net'
import {Plugin} from 'raxa-common'
import plugin from './plugin'

export default class MqttPlugin extends Plugin {
  server: Server

  async start() {
    const broker = createMqttBroker()
    const server = createServer(broker.handle)
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
        const packet: IPublishPacket = {
          cmd: 'publish',
          topic,
          payload: value,
          qos: 0,
          retain: false,
          dup: false,
        }
        if (clientId) {
          ;(broker.publish as any)(packet, clientId, () => {})
        } else {
          broker.publish(packet, () => {})
        }
      },
    )

    broker.on('publish', (packet, client) => {
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

    await new Promise(resolve => server.listen(1883, resolve))
  }

  async stop() {
    return new Promise(resolve => {
      this.server.close(resolve)
    })
  }
}
