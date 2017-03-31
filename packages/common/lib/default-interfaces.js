'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var defaultInterfaces = exports.defaultInterfaces = {
    Light: {
        id: 'Light',
        status: {
            on: {
                id: 'on',
                interfaceId: 'Light',
                type: 'boolean',
                modifiable: true,
                defaultValue: false
            }
        }
    },
    Dimmer: {
        id: 'Dimmer',
        status: {
            level: {
                id: 'level',
                interfaceId: 'Dimmer',
                type: 'integer',
                modifiable: true,
                max: 100,
                min: 0,
                defaultValue: 0
            }
        }
    },
    RGB: {
        id: 'RGB',
        status: {
            color: {
                id: 'color',
                interfaceId: 'RGB',
                type: 'object',
                modifiable: true,
                defaultValue: {
                    red: 0,
                    green: 0,
                    blue: 0
                },
                properties: {
                    red: {
                        id: 'red',
                        type: 'integer',
                        min: 0,
                        max: 255
                    },
                    green: {
                        id: 'green',
                        type: 'integer',
                        min: 0,
                        max: 255
                    },
                    blue: {
                        id: 'blue',
                        type: 'integer',
                        min: 0,
                        max: 255
                    }
                }
            }
        }
    },
    Temperature: {
        id: 'Temperature',
        status: {
            temp: {
                id: 'temp',
                interfaceId: 'Temperature',
                type: 'number',
                unit: '°C'
            }
        }
    }
};
//# sourceMappingURL=default-interfaces.js.map
