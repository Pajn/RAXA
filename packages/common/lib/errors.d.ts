export declare type RaxaError = {
    type: 'pluginNotEnabled';
    pluginId: string;
} | {
    type: 'missingDevice';
    deviceId: string;
} | {
    type: 'missingDeviceClass';
    deviceClassId: string;
} | {
    type: 'missingInterface';
    interfaceId: string;
} | {
    type: 'invalidDevice';
    joiError: any;
} | {
    type: 'invalidInterface';
    joiError: any;
} | {
    type: 'invalidDeviceClass';
    joiError: any;
} | {
    type: 'missingStatus';
    interfaceId: string;
    statusId: string;
} | {
    type: 'missingMethod';
    interfaceId: string;
    method: string;
} | {
    type: 'invalidArguments';
    interfaceId: string;
    method: string;
    joiError: any;
} | {
    type: 'interfaceNotImplemented';
    deviceId: string;
    interfaceId: string;
};
export declare function raxaError(error: RaxaError): (Error & {
    type: "pluginNotEnabled";
    pluginId: string;
}) | (Error & {
    type: "missingDevice";
    deviceId: string;
}) | (Error & {
    type: "missingDeviceClass";
    deviceClassId: string;
}) | (Error & {
    type: "missingInterface";
    interfaceId: string;
}) | (Error & {
    type: "invalidDevice";
    joiError: any;
}) | (Error & {
    type: "invalidInterface";
    joiError: any;
}) | (Error & {
    type: "invalidDeviceClass";
    joiError: any;
}) | (Error & {
    type: "missingStatus";
    interfaceId: string;
    statusId: string;
}) | (Error & {
    type: "missingMethod";
    interfaceId: string;
    method: string;
}) | (Error & {
    type: "invalidArguments";
    interfaceId: string;
    method: string;
    joiError: any;
}) | (Error & {
    type: "interfaceNotImplemented";
    deviceId: string;
    interfaceId: string;
});
