import { Device, Interface, Modification, Status } from './entities';
export declare function createModification(device: Device, status: Status, value: any): Modification;
export declare function isStatus(modification: Modification, status: Status): boolean;
/**
 * Adds an id to each interface and each status
 */
export declare function declareInterfaces(interfaces: {
    [id: string]: Interface;
}): {
    [id: string]: Interface;
};
