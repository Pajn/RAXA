library rest_interfaces_test;

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:guinness/guinness.dart';
import '../configuration.dart';

main() {
    describe('Interfaces', () {

        describe('get', () {

            it('should be able to get all interfaces', () =>
                http.get('$HOST/rest/interfaces')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        // Sort the list so that we can compare
                        response['data'].sort((a, b) => a['name'].compareTo(b['name']));

                        expect(response).toEqual({
                            'data': [
                                {
                                    'name': 'DimLevel',
                                    'methods': {
                                        'level': {
                                            'arguments': {
                                                'level': {
                                                    'type': 'integer',
                                                    'max': 'max',
                                                    'min': 'min'
                                                }
                                            },
                                            'status': 'level'
                                        }
                                    },
                                    'status': {
                                        'level': {
                                            'type': 'integer',
                                            'max': 'max',
                                            'min': 'min'
                                        }
                                    },
                                    'variables': {
                                        'max': {
                                            'type': 'integer'
                                        },
                                        'min': {
                                            'type': 'integer'
                                        }
                                    }
                                },
                                {
                                    'name': 'Lamp',
                                    'methods': {
                                        'on': {
                                            'status': 'on'
                                        },
                                        'off': {
                                            'status': 'off'
                                        }
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
                                    'name': 'TestInterface',
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
                            ],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be able to get a single interface', () =>
                http.get('$HOST/rest/interfaces/TestInterface')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': {
                                'name': 'TestInterface',
                            },
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be fail on getting a non existing interface', () =>
                http.get('$HOST/rest/interfaces/NonExistentInterface')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': 'Interface not found',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                })
            );
        });
    });
}
