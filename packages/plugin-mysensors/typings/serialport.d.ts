declare module 'serialport' {
  import {Transform, Duplex} from 'stream'

  type Parser = Transform

  export default class SerialPort extends Duplex {
    static parsers: {
      raw: Parser
      Readline: new (delimeter: string) => Parser
    }

    constructor(
      port: string,
      options?: {
        baudrate?: number
        parser?: Parser
      },
    )

    open(callback?: Function)
    close(callback?: Function)
    write(data: string)

    on(event, callback: Function)
    on(event: 'open', callback: () => void)
    on(event: 'end', callback: () => void)
    on(event: 'error', callback: () => void)
    on(event: 'data', callback: (data: string) => void)
  }
}
