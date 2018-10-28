import * as castv2 from 'castv2-player'
import {
  Call,
  Device,
  MediaItem,
  Modification,
  Plugin,
  actions,
  assert,
  defaultInterfaces,
} from 'raxa-common'
import plugin from './plugin'

export interface Chromecast extends Device {
  config: {
    host: string
    port: number
    name: string
    id: string
    [field: string]: any
  }
}

export enum MetadataType {
  // Generic template suitable for most media types. Used by cast.receiver.media.GenericMediaMetadata.
  GENERIC = 0,

  // A full length movie. Used by cast.receiver.media.MovieMediaMetadata.
  MOVIE = 1,

  // An episode of a TV series. Used by cast.receiver.media.TvShowMediaMetadata.
  TV_SHOW = 2,

  // A music track. Used by cast.receiver.media.MusicTrackMediaMetadata.
  MUSIC_TRACK = 3,

  // Photo. Used by cast.receiver.media.PhotoMediaMetadata.
  PHOTO = 4,

  // Audiobook chapter. Used by cast.receiver.media.AudiobookChapterMediaMetadata.
  AUDIOBOOK_CHAPTER = 5,
}

export type CCImage = {url: string; height?: number; width?: number}

/**
 * See https://developers.google.com/cast/docs/reference/receiver/cast.receiver.media.MusicTrackMediaMetadata
 */
export type CCMusicMetadata = {
  metadataType: MetadataType.MUSIC_TRACK
  title?: string
  songName: string
  albumName?: string
  albumArtist?: string
  artist?: string
  composer?: string
  trackNumber?: number
  discNumber?: number
  releaseDate?: string
  images: Array<CCImage>
}
export type CCMediaMetadata =
  | {
      metadataType: MetadataType.GENERIC
      title?: string
      subtitle?: string
      releaseDate?: string
      images: Array<CCImage>
    }
  | {
      metadataType: MetadataType.MOVIE
      title?: string
      subtitle?: string
      studio?: string
      releaseDate?: string
      images: Array<CCImage>
    }
  | {
      metadataType: MetadataType.TV_SHOW
      title?: string
      seriesTitle?: string
      season?: number
      episode?: number
      studio?: string
      originalAirdate?: string
      images: Array<CCImage>
    }
  | CCMusicMetadata
  | {
      metadataType: MetadataType.PHOTO
      title?: string
      artist?: string
      images: Array<CCImage>
      height?: number
      width?: number
      creationDateTime?: string
      location?: string
      latitude?: number
      longitude?: number
    }
  | {
      metadataType: MetadataType.AUDIOBOOK_CHAPTER
      title?: string
      subtitle?: string
      bookTitle: string
      chapterTitle?: string
      images: Array<CCImage>
    }

/**
 * See https://developers.google.com/cast/docs/reference/receiver/cast.receiver.media.MediaInformation
 */
export type CCMediaInformation = {
  contentId: string
  contentUrl?: string
  streamType: 'BUFFERED'
  contentType: string
  metadata: CCMediaMetadata
  duration: number
}

/**
 * See https://developers.google.com/cast/docs/reference/receiver/cast.receiver.media.QueueItem
 */
export type CCQueueItem = {
  itemId: number
  media: CCMediaInformation
  autoplay?: boolean
  preloadTime?: number
  startTime?: number
  playbackDuration?: number
  customData?: object
}

export type RepeatMode =
  | 'REPEAT_OFF'
  | 'REPEAT_ALL'
  | 'REPEAT_SINGLE'
  | 'REPEAT_ALL_AND_SHUFFLE'

export interface ClientStatusEvent {
  applications?: [
    {
      appId: string
      displayName: string
      isIdleScreen: boolean
      launchedFromCloud: boolean
      // namespaces: Array<>,
      sessionId: string
      statusText: string
      transportId: string
    }
  ]
  userEq: {
    high_shelf?: {frequency: number; gain_db: number; quality: number}
    low_shelf?: {frequency: number; gain_db: number; quality: number}
    max_peaking_eqs?: number
    // peaking_eqs: Array<>
  }
  volume: {
    controlType: 'attenuation' | 'master'
    level: number
    muted: boolean
    stepInterval: number
  }
}
export interface PlayerStatusEvent {
  mediaSessionId: number
  playbackRate: number
  playerState?: 'IDLE' | 'PLAYING' | 'PAUSED' | 'BUFFERING'
  currentTime: number
  supportedMediaCommands: number
  volume: {level: number; muted: boolean}
  media: CCMediaInformation
  currentItemId: number
  items: Array<CCQueueItem>
  repeatMode: RepeatMode
  customData: {
    queueVersion: string
    itemId: string
    canSkip: boolean
  }
  idleReason: 'INTERRUPTED'
  extendedStatus: {
    playerState: 'LOADING'
    media: CCMediaInformation
  }
}

export interface MediaPlayer {
  setVolumePromise(volumne: number): Promise<void>
  mutePromise(): Promise<void>
  unmutePromise(): Promise<void>

  pausePromise(): Promise<void>
  playPromise(): Promise<void>
  stopPromise(): Promise<void>

  jumpInPlaylistPromise(jum: number): Promise<void>

  on(event: 'clientStatus', cb: (event: ClientStatusEvent) => void)
  on(event: 'playerStatus', cb: (event?: PlayerStatusEvent) => void)
}

export default class ChromecastPlugin extends Plugin {
  mediaPlayers: {[deviceId: string]: MediaPlayer} = {}

  async start() {
    const Scanner = castv2.Scanner(console)
    const MediaPlayer = castv2.MediaPlayer(console)

    // tslint:disable-next-line:no-unused-expression
    new Scanner(
      (cc: {
        id: string
        name: string
        host: string
        port: number
        type: 'Chromecast' | 'Chromecast Audio'
      }) => {
        this.log.debug('Found chromecast', cc)
        const existingDevice: Chromecast | undefined = Object.values(
          this.state.getState().devices,
        ).find(
          device =>
            device.pluginId === plugin.id &&
            device.deviceClassId ===
              (cc.type === 'Chromecast Audio'
                ? plugin.deviceClasses.ChromecastAudio.id
                : plugin.deviceClasses.Chromecast.id) &&
            (device as Chromecast).config.id === cc.id,
        ) as Chromecast

        let device: Chromecast
        if (existingDevice) {
          device = existingDevice

          if (
            existingDevice.config.name !== cc.name ||
            existingDevice.config.host !== cc.host ||
            existingDevice.config.port !== cc.port
          ) {
            if (existingDevice.name === existingDevice.config.name) {
              device.name = cc.name
            }
            device.config = {
              id: cc.id,
              name: cc.name,
              host: cc.host,
              port: cc.port,
            }
            this.upsertDevice(device)
          }
        } else {
          device = {
            id: '',
            name: cc.name,
            config: {
              id: cc.id,
              name: cc.name,
              host: cc.host,
              port: cc.port,
            },
            pluginId: plugin.id,
            deviceClassId:
              cc.type === 'Chromecast Audio'
                ? plugin.deviceClasses.ChromecastAudio.id
                : plugin.deviceClasses.Chromecast.id,
          }
          this.upsertDevice(device)
        }

        const mp: MediaPlayer = new MediaPlayer(cc)
        this.mediaPlayers[device.id] = mp

        mp.on('clientStatus', e => {
          this.dispatch(actions.statusUpdated, {
            deviceId: device.id,
            interfaceId: plugin.interfaces.Chromecast.id,
            statusId: plugin.interfaces.Chromecast.status.application.id,
            value: e.applications && e.applications[0].displayName,
          })
          this.dispatch(actions.statusUpdated, {
            deviceId: device.id,
            interfaceId: defaultInterfaces.Volume.id,
            statusId: defaultInterfaces.Volume.status.volume.id,
            value: e.volume.level,
          })
          this.dispatch(actions.statusUpdated, {
            deviceId: device.id,
            interfaceId: defaultInterfaces.Mute.id,
            statusId: defaultInterfaces.Mute.status.muted.id,
            value: e.volume.muted,
          })

          if (!e.applications || e.applications[0].isIdleScreen) {
            this.dispatch(actions.statusUpdated, {
              deviceId: device.id,
              interfaceId: defaultInterfaces.CurrentlyPlaying.id,
              statusId:
                defaultInterfaces.CurrentlyPlaying.status.currentMedia.id,
              value: null,
            })
            this.dispatch(actions.statusUpdated, {
              deviceId: device.id,
              interfaceId: defaultInterfaces.CurrentlyPlaying.id,
              statusId:
                defaultInterfaces.CurrentlyPlaying.status.playerState.id,
              value: 'idle',
            })
          }
        })

        mp.on('playerStatus', e => {
          if (e) {
            this.dispatch(actions.statusUpdated, {
              deviceId: device.id,
              interfaceId: defaultInterfaces.CurrentlyPlaying.id,
              statusId:
                defaultInterfaces.CurrentlyPlaying.status.currentMedia.id,
              value:
                e.media &&
                e.media.metadata &&
                assert<MediaItem>({
                  title: e.media.metadata.title || '',
                  artwork:
                    e.media.metadata.images && e.media.metadata.images[0].url,
                  duration: e.media.duration,
                  album: (e.media.metadata as CCMusicMetadata).albumName,
                  artist: (e.media.metadata as CCMusicMetadata).artist,
                }),
            })
            this.dispatch(actions.statusUpdated, {
              deviceId: device.id,
              interfaceId: defaultInterfaces.CurrentlyPlaying.id,
              statusId:
                defaultInterfaces.CurrentlyPlaying.status.playerState.id,
              value: e.playerState && e.playerState.toLowerCase(),
            })
          }
        })
      },
      {maxMatches: 10},
    )
  }

  async onDeviceStatusModified(modification: Modification, device: Chromecast) {
    if (modification.interfaceId === defaultInterfaces.Volume.id) {
      const mp = this.mediaPlayers[device.id]
      if (!mp) throw 'Can not connect to device'

      switch (modification.statusId) {
        case defaultInterfaces.Volume.status.volume.id:
          await mp.setVolumePromise(+modification.value * 100)
          break
        case defaultInterfaces.Mute.status.muted.id:
          if (modification.value === 'true') {
            await mp.mutePromise()
          } else {
            await mp.unmutePromise()
          }
          break
      }
    }
  }

  async onDeviceCalled(call: Call, device: Chromecast) {
    if (call.interfaceId === defaultInterfaces.CurrentlyPlaying.id) {
      const mp = this.mediaPlayers[device.id]
      if (!mp) throw 'Can not connect to device'

      switch (call.method) {
        case defaultInterfaces.CurrentlyPlaying.methods.play.id:
          await mp.playPromise()
          break
        case defaultInterfaces.CurrentlyPlaying.methods.pause.id:
          await mp.pausePromise()
          break
        case defaultInterfaces.CurrentlyPlaying.methods.stop.id:
          await mp.stopPromise()
          break
      }
    }
    if (call.interfaceId === defaultInterfaces.MediaPlaylist.id) {
      const mp = this.mediaPlayers[device.id]
      if (!mp) throw 'Can not connect to device'

      switch (call.method) {
        case defaultInterfaces.MediaPlaylist.methods.next.id:
          await mp.jumpInPlaylistPromise(1)
          break
        case defaultInterfaces.MediaPlaylist.methods.previous.id:
          await mp.jumpInPlaylistPromise(-1)
          break
      }
    }
  }
}
