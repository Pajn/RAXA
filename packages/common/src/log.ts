export class Log {
  logger = console

  get fullName() {
    if (!this.parent) return this.name
    return `${this.parent.fullName}.${this.name}`
  }

  constructor(public name?: string, public parent?: Log) {}

  debug(...messages) {
    this.logger.log(this.header('debug'), ...messages)
  }

  info(...messages) {
    this.logger.info(this.header('info'), ...messages)
  }

  warn(...messages) {
    this.logger.warn(this.header('warn'), ...messages)
  }

  error(...messages) {
    this.logger.error(this.header('error'), ...messages)
  }

  createChild(name) {
    return new Log(name, this)
  }

  private header(level: string) {
    return `${new Date().toISOString()} ${this.fullName} [${level}]:`
  }
}
