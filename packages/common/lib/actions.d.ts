import { Action } from 'redux-decorated';
import { Device, DeviceClass, Interface, PluginConfiguration } from './entities';
import { InterfaceState } from './state';
export declare const actions: {
    deviceAdded: Action<{
        device: Device;
        interfaces: InterfaceState;
    }>;
    deviceUpdated: Action<{
        device: Device;
    }>;
    deviceRemoved: Action<{
        device: Device;
    }>;
    deviceClassAdded: Action<{
        deviceClass: DeviceClass;
    }>;
    deviceClassUpdated: Action<{
        deviceClass: DeviceClass;
    }>;
    deviceClassRemoved: Action<{
        deviceClass: DeviceClass;
    }>;
    interfaceAdded: Action<{
        iface: Interface;
    }>;
    interfaceUpdated: Action<{
        iface: Interface;
    }>;
    interfaceRemoved: Action<{
        iface: Interface;
    }>;
    pluginAdded: Action<{
        plugin: PluginConfiguration;
    }>;
    pluginUpdated: Action<{
        plugin: PluginConfiguration;
    }>;
    pluginRemoved: Action<{
        plugin: PluginConfiguration;
    }>;
    statusUpdated: Action<{
        deviceId: string;
        interfaceId: string;
        statusId: string;
        value: any;
    }>;
};
