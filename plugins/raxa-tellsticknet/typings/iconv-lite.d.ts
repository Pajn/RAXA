declare module 'iconv-lite' {
  class IconvStatic {
    static decode(buffer: Buffer, encoding: string): string;
    static encode(message: string, encoding: string): Buffer;
  }

  export default IconvStatic;
}
