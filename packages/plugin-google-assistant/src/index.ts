import {Server} from 'hapi'
import {asArray, asAsyncIterable, map} from 'iterates/cjs/async'
import {filterMap} from 'iterates/cjs/sync'
import {DeviceType, Plugin, defaultInterfaces} from 'raxa-common'
import sceneryPlugin from 'raxa-plugin-scenery/cjs/plugin'

const INTENT_SYNC = 'action.devices.SYNC'
const INTENT_EXECUTE = 'action.devices.EXECUTE'

const TRAIT_ONOFF = 'action.devices.traits.OnOff'
const TRAIT_BRIGHTNESS = 'action.devices.traits.Brightness'
const TRAIT_RGB_COLOR = 'action.devices.traits.ColorSpectrum'
const TRAIT_COLOR_TEMP = 'action.devices.traits.ColorTemperature'
const TRAIT_SCENE = 'action.devices.traits.Scene'

const COMMAND_ONOFF = 'action.devices.commands.OnOff'
const COMMAND_BRIGHTNESS = 'action.devices.commands.BrightnessAbsolute'
const COMMAND_COLOR = 'action.devices.commands.ColorAbsolute'
const COMMAND_ACTIVATESCENE = 'action.devices.commands.ActivateScene'

const TYPE_LIGHT = 'action.devices.types.LIGHT'
const TYPE_OUTLET = 'action.devices.types.OUTLET'
const TYPE_SCENE = 'action.devices.types.SCENE'

const BASE_OAUTH_URL = 'https://oauth-redirect.googleusercontent.com'

export default class GoogleAssistantPlugin extends Plugin {
  projectId = 'assistant-173811'
  clientId = 'sleipner-google-assistant'
  accessToken = ''
  server: any

  async start() {
    const server = new Server({port: 13000, routes: {cors: true}} as any) as any
    this.server = server

    server.events.on('response', request => {
      this.log.debug(
        request.info.remoteAddress +
          ': ' +
          request.method.toUpperCase() +
          ' ' +
          request.url.path +
          ' --> ' +
          (request.response && request.response.statusCode),
      )
    })

    setupAuth(this, server)
    setupHandlers(this, server)

    await server.start()
  }

  async stop() {
    await this.server.stop()
  }
}

function setupAuth(plugin: GoogleAssistantPlugin, server: Server) {
  /** Generate the redirect format for the oauth request. */
  function redirectUrl(accessToken: string, state: string) {
    return `${BASE_OAUTH_URL}/r/${
      plugin.projectId
    }?access_token=${accessToken}&token_type=bearer&state=${state}`
  }

  // Handle oauth token request
  server.route({
    method: 'GET',
    path: '/auth',
    handler(request, h) {
      const {redirect_uri, state, client_id} = request.query as {
        redirect_uri: string
        state: string
        client_id: string
      }
      if (!redirect_uri) {
        const msg = 'missing redirect_uri field'
        plugin.log.warn(msg)
        return h.response(msg).code(400)
      }

      if (!redirect_uri.includes(plugin.projectId)) {
        const msg = 'missing project_id in redirect_uri'
        plugin.log.warn(msg)
        return h.response(msg).code(400)
      }
      if (!state) {
        const msg = 'oauth request missing state'
        plugin.log.warn(msg)
        return h.response(msg).code(400)
      }
      if (plugin.clientId !== client_id) {
        const msg = 'invalid client id'
        plugin.log.warn(msg)
        return h.response(msg).code(401)
      }

      const generatedUrl = redirectUrl(plugin.accessToken, state)

      plugin.log.info('user login in from Google Assistant')
      return h.response('redirect success').redirect(generatedUrl)
    },
  })
}

function setupHandlers(plugin: GoogleAssistantPlugin, server: Server) {
  function handleSync(): AssistantSyncIntentResponse {
    const state = plugin.state.getState()
    const devices = Object.values(state.devices)
      .filter(device => {
        const types =
          device.types || state.deviceClasses[device.deviceClassId].types
        return (
          types.includes(DeviceType.Light) ||
          types.includes(DeviceType.Outlet) ||
          types.includes(DeviceType.Scenery)
        )
      })
      .map((device): AssistantDevice => {
        const types =
          device.types || state.deviceClasses[device.deviceClassId].types
        const interfaceIds =
          device.interfaceIds ||
          state.deviceClasses[device.deviceClassId].interfaceIds

        return {
          id: device.id,
          type: [
            ...filterMap(type => {
              switch (type) {
                case DeviceType.Light:
                  return TYPE_LIGHT
                case DeviceType.Outlet:
                  return TYPE_OUTLET
                case DeviceType.Scenery:
                  return TYPE_SCENE
                default:
                  return undefined
              }
            }, types),
          ][0] as AssistantTypes,
          traits: [
            ...filterMap(i => {
              switch (i) {
                case defaultInterfaces.Power.id:
                  return TRAIT_ONOFF
                case defaultInterfaces.Dimmer.id:
                  return TRAIT_BRIGHTNESS
                // case defaultInterfaces.Color.id: return TRAIT_RGB_COLOR
                case 'Scenery':
                  return TRAIT_SCENE
                default:
                  return undefined
              }
            }, interfaceIds),
          ],
          name: {
            defaultNames: [device.deviceClassId],
            name: device.name,
            nicknames: [],
          },
          willReportState: types.includes(DeviceType.Scenery),
        }
      })
      .filter(device => device.traits.length > 0)

    return {
      devices,
    }
  }

  async function handleExecute({
    commands,
  }: AssistantExecuteIntent['payload']): Promise<
    AssistantExecuteIntentResponse
  > {
    return {
      commands: await asArray(
        map(async (command: AssistantCommand): Promise<CommandResponse> => {
          let states: DeviceStates | undefined
          let status: CommandResponse['status'] = 'SUCCESS'
          try {
            for (const execution of command.execution) {
              switch (execution.command) {
                case COMMAND_ONOFF: {
                  for (const {id} of command.devices) {
                    await plugin.setDeviceStatus({
                      deviceId: id,
                      interfaceId: defaultInterfaces.Power.id,
                      statusId: defaultInterfaces.Power.status.on.id,
                      value: execution.params.on,
                    })
                    states = {on: execution.params.on}
                  }
                  break
                }
                case COMMAND_BRIGHTNESS: {
                  for (const {id} of command.devices) {
                    await plugin.setDeviceStatus({
                      deviceId: id,
                      interfaceId: defaultInterfaces.Dimmer.id,
                      statusId: defaultInterfaces.Dimmer.status.level.id,
                      value: execution.params.brightness,
                    })
                    states = {brightness: execution.params.brightness}
                  }
                  break
                }
                case COMMAND_COLOR: {
                  throw 'not implemented'
                }
                case COMMAND_ACTIVATESCENE: {
                  status = 'PENDING'
                  for (const {id} of command.devices) {
                    plugin.callDevice({
                      deviceId: id,
                      interfaceId: sceneryPlugin.interfaces.Scenery.id,
                      method: sceneryPlugin.interfaces.Scenery.methods.set.id,
                      arguments: {},
                    })
                  }
                  break
                }
              }
            }
          } catch (e) {
            return {
              ids: command.devices.map(d => d.id),
              status: 'ERROR',
              errorCode: `${e}`,
            }
          }
          return {
            ids: command.devices.map(d => d.id),
            status,
            states,
          }
        }, asAsyncIterable(commands)),
      ),
    }
  }

  server.route({
    method: 'POST',
    path: '/action',
    async handler(request, h) {
      console.log('request.headers', request.headers)
      const {authorization} = request.headers

      if (authorization !== `Bearer ${plugin.accessToken}`) {
        const msg = 'missing authorization'
        plugin.log.error(msg)
        h.response(msg).code(401)
      }

      const {requestId, inputs} = request.payload as AssistantAction

      if (inputs.length !== 1) {
        const msg = 'Only one input per request is supported'
        plugin.log.error(msg, inputs)
        h.response(msg).code(400)
      }

      for (const input of inputs) {
        switch (input.intent) {
          case INTENT_SYNC:
            return assert<AssistantResponse<AssistantSyncIntentResponse>>({
              requestId,
              payload: handleSync(),
            })
          case INTENT_EXECUTE:
            return assert<AssistantResponse<AssistantExecuteIntentResponse>>({
              requestId,
              payload: await handleExecute(input.payload),
            })
        }
      }
    },
  })
}

function assert<T>(a: T) {
  return a
}

type AssistantAction = {
  requestId: string
  inputs: Array<AssistantIntents>
}
type AssistantIntents = AssistantSyncIntent | AssistantExecuteIntent
type AssistantSyncIntent = {
  intent: typeof INTENT_SYNC
}
type AssistantCommand = {
  devices: Array<{
    id: string
  }>
  execution: Array<{
    command: AssistantCommands
    params: DeviceStates
  }>
}
type DeviceStates = {
  on?: boolean
  brightness?: number
  color?: {spectrumRGB: number}
}
type AssistantExecuteIntent = {
  intent: typeof INTENT_EXECUTE
  payload: {
    commands: Array<AssistantCommand>
  }
}
type AssistantResponse<T> = {
  requestId: string
  payload: T
}
type AssistantSyncIntentResponse = {
  devices: Array<AssistantDevice>
}
type AssistantExecuteIntentResponse = {
  commands: Array<CommandResponse>
}
type CommandResponse = {
  ids: Array<string>
  status: 'SUCCESS' | 'PENDING' | 'OFFLINE' | 'ERROR'
  states?: DeviceStates
  errorCode?: string
  debugString?: string
}
type AssistantTypes = typeof TYPE_LIGHT | typeof TYPE_OUTLET | typeof TYPE_SCENE
type AssistantTraits =
  | typeof TRAIT_ONOFF
  | typeof TRAIT_BRIGHTNESS
  | typeof TRAIT_RGB_COLOR
  | typeof TRAIT_COLOR_TEMP
  | typeof TRAIT_SCENE
type AssistantCommands =
  | typeof COMMAND_ONOFF
  | typeof COMMAND_BRIGHTNESS
  | typeof COMMAND_COLOR
  | typeof COMMAND_ACTIVATESCENE
type AssistantDevice = {
  id: string
  type: AssistantTypes
  traits: Array<AssistantTraits>
  name: {
    defaultNames: Array<string>
    name: string
    nicknames: Array<string>
  }
  willReportState: boolean
}
