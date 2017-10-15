declare module 'serialport-js' {
  import {Transform, Duplex} from 'stream'

  type Parser = Transform

  export interface SerialPort extends Duplex {
    send(data: string)

    on(event, callback: Function)
    on(event: 'closed', callback: () => void)
    on(event: 'error', callback: () => void)
    on(event: 'data', callback: (data: string) => void)
  }

  export function open(port: string, delimiter?: string): SerialPort
}
