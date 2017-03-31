import { Device, DeviceClass, Interface, PluginConfiguration } from './entities';
export declare type DeviceState = {
    [id: string]: Device;
};
export declare type DeviceClassState = {
    [id: string]: DeviceClass;
};
export declare type InterfaceState = {
    [id: string]: Interface;
};
export declare type PluginState = {
    [id: string]: PluginConfiguration;
};
export declare type StatusState = {
    [deviceId: string]: {
        [interfaceId: string]: {
            [status: string]: any;
        };
    };
};
export declare type State = {
    devices: DeviceState;
    deviceClasses: DeviceClassState;
    interfaces: InterfaceState;
    plugins: PluginState;
    status: StatusState;
};
