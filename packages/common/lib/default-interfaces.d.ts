export declare const defaultInterfaces: {
    Light: {
        id: string;
        status: {
            on: {
                id: string;
                interfaceId: string;
                type: "boolean";
                modifiable: boolean;
                defaultValue: boolean;
            };
        };
    };
    Dimmer: {
        id: string;
        status: {
            level: {
                id: string;
                interfaceId: string;
                type: "integer";
                modifiable: boolean;
                max: number;
                min: number;
                defaultValue: number;
            };
        };
    };
    RGB: {
        id: string;
        status: {
            color: {
                id: string;
                interfaceId: string;
                type: "object";
                modifiable: boolean;
                defaultValue: {
                    red: number;
                    green: number;
                    blue: number;
                };
                properties: {
                    red: {
                        id: string;
                        type: "integer";
                        min: number;
                        max: number;
                    };
                    green: {
                        id: string;
                        type: "integer";
                        min: number;
                        max: number;
                    };
                    blue: {
                        id: string;
                        type: "integer";
                        min: number;
                        max: number;
                    };
                };
            };
        };
    };
    Temperature: {
        id: string;
        status: {
            temp: {
                id: string;
                interfaceId: string;
                type: "number";
                unit: string;
            };
        };
    };
};
