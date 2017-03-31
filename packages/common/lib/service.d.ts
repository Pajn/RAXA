import { Action } from 'redux-decorated';
import { Awaitable } from './entities';
import { Log } from './log';
export declare type Scope = string | number | ScopeObject | ScopeArray;
export declare type ScopeObject = {
    [x: string]: Scope;
};
export interface ScopeArray extends Array<Scope> {
}
export interface Options {
    where: any;
}
export interface S {
    scalar(scope: Scope, options?: Options): any;
    list(scope: Scope, options?: Options): any[];
}
export declare class StateQuery implements S {
    private storage;
    constructor(storage: any);
    scalar(scope: Scope, options?: Options): any;
    list(scope: Scope, options?: Options): any[];
}
export declare abstract class Service {
    log: Log;
    serviceManager: ServiceManager;
    dispatch: <P>(action: Action<P>, payload: P) => void;
    state: S;
    /**
     * Called when the service is stared, either becuse of beeing activated or when RAXA
     * is starting. If a Promise is returned then RAXA will wait for it to be resolved.
     */
    start(): Awaitable<any>;
    /**
     * Called when the service is stopped, either becuse of beeing deactivated or when RAXA
     * is stopping. If a Promise is returned then RAXA will wait for it to be resolved.
     */
    stop(): Awaitable<any>;
}
export interface ServiceImplementation {
    new (): Service;
}
export declare class ServiceManager {
    private rootLogger;
    log: Log;
    runningServices: {
        [name: string]: Service;
    };
    startOrder: Array<string>;
    constructor(rootLogger?: any);
    /**
     * Starts all passed services
     */
    startServices(...services: Array<ServiceImplementation>): Promise<void>;
    startService(service: ServiceImplementation): Promise<Service>;
    protected configureService(service: ServiceImplementation, serviceInstance: Service): void;
    /**
     * Stops all services in the reverse order of how they started
     */
    stopServices(): Promise<void>;
    stopService(name: string): Promise<void>;
}
