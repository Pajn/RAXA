library rest_deviceClasses_test;

import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:guinness/guinness.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../configuration.dart';

main() {
    describe('DeviceClasses', () {

        describe('get', () {

            it('should be able to get all deviceClasses', () =>
                http.get('$HOST/rest/deviceclasses')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {

                        expect(response).toEqual({
                            'data': [
                                {
                                    'name': 'TestClass',
                                    'implementedInterfaces': ['TestInterface'],
                                    'plugin': 'TestPlugin',
                                }
                            ],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be able to get all deviceClasses by a plugin', () =>
            http.get('$HOST/rest/deviceclasses/TestPlugin')
            .then((response) => JSON.decode(response.body))
            .then((response) {

                expect(response).toEqual({
                    'data': [
                        {
                            'name': 'TestClass',
                            'implementedInterfaces': ['TestInterface'],
                            'plugin': 'TestPlugin',
                        }
                    ],
                    'status': 'success',
                    'version': '0.0.0',
                });
            })
            );

            it('should be able to get filtered deviceClasses', () {
                var query = Uri.encodeQueryComponent(JSON.encode({
                    'implementedInterfaces':'TestInterface'
                }));

                return http.get('$HOST/rest/deviceclasses?query=$query')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': [{
                                'name': 'TestClass',
                                'implementedInterfaces': ['TestInterface'],
                                'plugin': 'TestPlugin',
                            }],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    });
            });

            it('should be return an empty response when to hard filter is used', () {
                var query = Uri.encodeQueryComponent(JSON.encode({'name':'NonExistentName'}));

                return http.get('$HOST/rest/deviceclasses?query=$query')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': [],
                        'status': 'success',
                        'version': '0.0.0',
                    });
                });
            });

            it('should be able to get a single deviceClasses', () =>
                http.get('$HOST/rest/deviceclasses/TestPlugin/TestClass')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': {
                                'name': 'TestClass',
                                'implementedInterfaces': ['TestInterface'],
                                'plugin': 'TestPlugin',
                            },
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be fail on getting a deciveClass from a non existing plugin', () =>
                http.get('$HOST/rest/deviceclasses/NonExistentPlugin/TestClass')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': 'DeviceClass not found',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                })
            );

            it('should be fail on getting a non existing deviceClass', () =>
                http.get('$HOST/rest/deviceclasses/TestPlugin/NonExistentClass')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': 'DeviceClass not found',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                })
            );
        });
    });
}
