declare module 'serialport' {
  type Parser = {};

  export class SerialPort {
    constructor(port: string, options?: {
      baudrate?: number,
      parser?: Parser,
    });

    open(callback?: Function);
    close(callback?: Function);
    write(data: string);

    on(event, callback: Function);
    on(event: 'open', callback: () => void);
    on(event: 'end', callback: () => void);
    on(event: 'error', callback: () => void);
    on(event: 'data', callback: (data: string) => void);
  }

  export const parsers: {
    raw: Parser,
    readline(delimeter: string): Parser,
  };
}
