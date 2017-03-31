import { Call, Device, Modification, Plugin } from 'raxa-common';
export interface SerialGateway extends Device {
    config: {
        serialPort: string;
        [field: string]: any;
    };
}
export interface Sensor extends Device {
    config: {
        gateway: number;
        node: number;
        sensor: number;
        [field: string]: any;
    };
}
export default class MySensorsPlugin extends Plugin {
    onDeviceCreated(device: Sensor | SerialGateway): void;
    onDeviceStatusModified(modification: Modification, device: Sensor): any;
    onDeviceCalled(call: Call, device: Sensor | SerialGateway): void;
    start(): void;
    stop(): Promise<{}[]>;
    private openGateway({id, config});
    private send(deviceId, node, sensor, type, subType, payload);
    private receivedMessage(deviceId, message);
    private getSensor(gateway, node, sensor);
    private sensorPresented(gatewayId, nodeId, sensor, type);
    private nameReceived(gatewayId, nodeId, name);
    private statusUpdate(gatewayId, nodeId, sensor, type, value);
    private statusRequest(gatewayId, nodeId, sensor, type);
}
