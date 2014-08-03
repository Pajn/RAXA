part of raxa.interface;

var defaultInterfaces = [
    {
        'name': 'Lamp',
        'methods': {
            'on': {
                'status': 'on'
            },
            'off': {
                'status': 'off'
            },
        },
        'status': {
            'on': {
                'type': 'boolean'
            },
            'off': {
                'type': 'boolean'
            }
        }
    },
    {
        'name': 'DimLevel',
        'methods': {
            'level': {
                'arguments': {
                    'level': {
                        'type': 'integer',
                        'max': 'max',
                        'min': 'min',
                    }
                },
                'status': 'level',
            },
        },
        'status': {
            'level': {
                'type': 'integer',
                'max': 'max',
                'min': 'min',
            }
        },
        'variables': {
            'max': {
                'type': 'integer',
            },
            'min': {
                'type': 'integer',
            }
        }
    },
    {
        'name': 'Trigger',
        'events': {
            'triggered': {
                'data': {
                    'identifier': {
                        'type': 'string'
                    }
                }
            }
        }
    }
];
