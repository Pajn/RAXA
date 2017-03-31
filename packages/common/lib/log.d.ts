export declare class Log {
    name: string;
    parent: Log;
    logger: Console;
    readonly fullName: any;
    constructor(name?: string, parent?: Log);
    debug(...messages: any[]): void;
    info(...messages: any[]): void;
    warn(...messages: any[]): void;
    error(...messages: any[]): void;
    createChild(name: any): Log;
    private header(level);
}
