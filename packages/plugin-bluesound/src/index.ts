import xmlParser from 'fast-xml-parser'
import {Subject, filter, map} from 'iterates/cjs/async'
import {pipeValue} from 'iterates/cjs/utils'
import mdnsFactory from 'multicast-dns'
import fetch from 'node-fetch'
import {
  Call,
  Device,
  Modification,
  Plugin,
  actions,
  defaultInterfaces,
} from 'raxa-common'
import plugin from './plugin'

export interface BluesoundPlayer extends Device {
  config: {
    host: string
    model: string
    name: string
    id: string
    [field: string]: any
  }
}

export type MediaItem = {
  title: string
  artwork: string
  duration: number
}

const baseUrl = (device: BluesoundPlayer) =>
  `http://${device.config.host}:11000`

async function query(host: string, path: string) {
  const baseUrl = `http://${host}:11000`
  const response = await fetch(`${baseUrl}/${path}`)

  const text = await response.text()
  return xmlParser.parse(text, {
    ignoreAttributes: false,
    attributeNamePrefix: '',
  })
}

export default class BluesoundPlugin extends Plugin {
  timers: Array<any> = []
  stopMdns: () => void = undefined as any

  async start() {
    const mdns = mdnsFactory()
    const mdnsResponse = new Subject<{
      answers: Array<{name: string; type: string; data: string}>
    }>()
    this.stopMdns = () => {
      mdns.destroy()
      mdnsResponse.done()
    }

    mdns.on('response', response => mdnsResponse.next(response))
    const registeredPlayers = new Set<string>()

    const players = pipeValue(
      mdnsResponse,
      filter(
        response =>
          response.answers.some(answer => answer.name === '_musc._tcp.local') &&
          response.answers.some(answer => answer.type === 'A'),
      ),
      map(response => ({
        ip: response.answers.find(answer => answer.type === 'A')!
          .data as string,
      })),
      filter(({ip}) => !registeredPlayers.has(ip)),
    )
    ;(async () => {
      for await (const player of players) {
        registeredPlayers.add(player.ip)
        const syncStatus = await query(player.ip, 'SyncStatus')

        const existingDevice: BluesoundPlayer | undefined = Object.values(
          this.state.getState().devices,
        ).find(
          device =>
            device.pluginId === plugin.id &&
            device.deviceClassId === plugin.deviceClasses.BluesoundPlayer.id &&
            (device as BluesoundPlayer).config.id === syncStatus.SyncStatus.mac,
        ) as BluesoundPlayer

        let device: BluesoundPlayer
        if (existingDevice) {
          device = existingDevice
        } else {
          device = {
            id: '',
            name: syncStatus.SyncStatus.name,
            config: {
              id: syncStatus.SyncStatus.mac,
              model: syncStatus.SyncStatus.modelName,
              name: syncStatus.SyncStatus.name,
              host: player.ip,
            },
            pluginId: plugin.id,
            deviceClassId: plugin.deviceClasses.BluesoundPlayer.id,
          }
          await this.upsertDevice(device)

          const sources = await query(player.ip, 'RadioBrowse?service=Capture')

          this.dispatch(actions.statusUpdated, {
            deviceId: device.id,
            interfaceId: plugin.interfaces.MediaSources.id,
            statusId: plugin.interfaces.MediaSources.status.avalibleSources.id,
            value: sources.radiotime.item.map(source => ({
              id: source.URL,
              name: source.text,
              artwork: `${baseUrl}/${source.image}`,
            })),
          })
        }

        const syncDevice = () => this.syncStatus(device)

        syncDevice()
        this.timers.push(setInterval(syncDevice, 5000))
      }
    })()

    const queryDns = () =>
      mdns.query({
        questions: [
          {
            name: '_musc._tcp.local',
            type: 'PTR',
          },
        ],
      })

    queryDns()
    this.timers.push(setInterval(queryDns, 60000))
  }

  async stop() {
    this.timers.forEach(timer => clearInterval(timer))
    this.stopMdns()
  }

  async onDeviceStatusModified(
    modification: Modification,
    device: BluesoundPlayer,
  ) {
    if (modification.interfaceId === defaultInterfaces.Volume.id) {
      switch (modification.statusId) {
        case defaultInterfaces.Volume.status.volume.id:
          await this.setVolume(device, +modification.value)
          break
      }
    }
  }

  async onDeviceCalled(call: Call, device: BluesoundPlayer) {
    if (call.interfaceId === defaultInterfaces.CurrentlyPlaying.id) {
      switch (call.method) {
        case defaultInterfaces.CurrentlyPlaying.methods.play.id:
          await this.play(device)
          break
        case defaultInterfaces.CurrentlyPlaying.methods.pause.id:
          await this.pause(device)
          break
        case defaultInterfaces.CurrentlyPlaying.methods.stop.id:
          await this.pause(device)
          break
      }
    }
  }

  private async syncStatus(device: BluesoundPlayer) {
    const status = await query(device.config.host, 'Status')

    this.dispatch(actions.statusUpdated, {
      deviceId: device.id,
      interfaceId: defaultInterfaces.Volume.id,
      statusId: defaultInterfaces.Volume.status.volume.id,
      value: +status.status.volume / 100,
    })

    let currentMedia: MediaItem | null = null
    if (status.status.album && status.status.artist && status.status.title1) {
      currentMedia = {
        title: status.status.title1,
        artwork: status.status.image,
        duration: status.status.totlen,
      }
    }
    const isPaused = status.status.state === 'pause'

    this.dispatch(actions.statusUpdated, {
      deviceId: device.id,
      interfaceId: defaultInterfaces.CurrentlyPlaying.id,
      statusId: defaultInterfaces.CurrentlyPlaying.status.currentMedia.id,
      value: currentMedia,
    })
    this.dispatch(actions.statusUpdated, {
      deviceId: device.id,
      interfaceId: defaultInterfaces.CurrentlyPlaying.id,
      statusId: defaultInterfaces.CurrentlyPlaying.status.playerState.id,
      value: currentMedia ? (isPaused ? 'paused' : 'playing') : 'idle',
    })
  }

  private async setVolume(device: BluesoundPlayer, volume: number) {
    await fetch(`${baseUrl(device)}/Volume?level=${Math.round(volume * 100)}`)
    this.dispatch(actions.statusUpdated, {
      deviceId: device.id,
      interfaceId: defaultInterfaces.Volume.id,
      statusId: defaultInterfaces.Volume.status.volume.id,
      value: volume,
    })
  }

  private async play(device: BluesoundPlayer) {
    await fetch(`${baseUrl(device)}/Play`)
    this.syncStatus(device)
  }
  private async pause(device: BluesoundPlayer) {
    await fetch(`${baseUrl(device)}/Pause`)
    this.syncStatus(device)
  }
}
