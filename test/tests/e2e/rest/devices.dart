library rest_devices_test;

import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:guinness/guinness.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../configuration.dart';

main() {
    describe('Devices', () {
        var deviceIds = [];

        describe('post', () {
            var testDevice = {
                'name': 'TestDevice',
                'plugin': 'TestPlugin',
                'deviceClass': 'TestClass',
            };

            it('should be able to create devices', () =>
                Future.wait([
                    http.post('$HOST/rest/devices', body: JSON.encode(testDevice)).then((response) {
                        expect(JSON.decode(response.body)).toEqual({
                            'data': 'Creation of device succeeded',
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    }),
                    http.post('$HOST/rest/devices', body: JSON.encode(
                            testDevice..['name'] = 'TestDevice2')
                        ).then((response) {
                            expect(JSON.decode(response.body)).toEqual({
                                'data': 'Creation of device succeeded',
                                'status': 'success',
                                'version': '0.0.0',
                            });
                        })
                ])
            );

            it('should not be able to create a device with the same name', () =>
                http.post('$HOST/rest/devices', body: JSON.encode(testDevice)).then((response) {
                    expect(JSON.decode(response.body)).toEqual({
                        'data': 'Creation of device failed',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                })
            );

            it('should not be able to create a device with a non existing plugin', () {
                testDevice['plugin'] = 'NonExistingPlugin';

                return http.post('$HOST/rest/devices', body: JSON.encode(testDevice)).then((response) {
                    expect(JSON.decode(response.body)).toEqual({
                        'data': 'Creation of device failed',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                });
            });

            it('should not be able to create a device with a non existing deviceClass', () {
                testDevice['deviceClass'] = 'NonExistingClass';

                return http.post('$HOST/rest/devices', body: JSON.encode(testDevice)).then((response) {
                    expect(JSON.decode(response.body)).toEqual({
                        'data': 'Creation of device failed',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                });
            });
        });

        describe('get', () {

            it('should be able to get all devices', () =>
                http.get('$HOST/rest/devices')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        deviceIds = response['data'].map((device) => device['_id']).toList();
                        response['data'].forEach((device) => device['_id'] = '');

                        expect(response).toEqual({
                            'data': [
                                {
                                    'name': 'TestDevice',
                                    'plugin': 'TestPlugin',
                                    'deviceClass': 'TestClass',
                                    'implementedInterfaces': ['TestInterface'],
                                    'variables': {},
                                    '_id': ''
                                },
                                {
                                    'name': 'TestDevice2',
                                    'plugin': 'TestPlugin',
                                    'deviceClass': 'TestClass',
                                    'implementedInterfaces': ['TestInterface'],
                                    'variables': {},
                                    '_id': ''
                                }
                            ],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be able to get filtered devices', () {
                var query = Uri.encodeQueryComponent(JSON.encode({'name':'TestDevice'}));

                return http.get('$HOST/rest/devices?query=$query')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': [{
                                'name': 'TestDevice',
                                'plugin': 'TestPlugin',
                                'deviceClass': 'TestClass',
                                'implementedInterfaces': ['TestInterface'],
                                'variables': {},
                                '_id': deviceIds.first
                            }],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    });
            });

            it('should be return an empty response when to hard filter is used', () {
                var query = Uri.encodeQueryComponent(JSON.encode({'name':'NonExistantName'}));

                return http.get('$HOST/rest/devices?query=$query')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': [],
                        'status': 'success',
                        'version': '0.0.0',
                    });
                });
            });

            it('should be able to get a single devices', () =>
                http.get('$HOST/rest/devices/${deviceIds.first}')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': {
                                'name': 'TestDevice',
                                'plugin': 'TestPlugin',
                                'deviceClass': 'TestClass',
                                'implementedInterfaces': ['TestInterface'],
                                'variables': {},
                                '_id': deviceIds.first
                            },
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be fail on getting a non existing device', () =>
                http.get('$HOST/rest/devices/${new ObjectId().toHexString()}')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': 'Device not found',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                })
            );
        });

        describe('put', () {

            it('should be able to change devices', () {
                var query = Uri.encodeQueryComponent(JSON.encode({'name':'TestDevice'}));

                return http.put('$HOST/rest/devices/${deviceIds.last}', body: JSON.encode({
                        'name': 'TestedDevice'
                    }))
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': 'Update of device succeeded',
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    })
                    .then((_) {
                        http.get('$HOST/rest/devices/${deviceIds.last}')
                            .then((response) => JSON.decode(response.body))
                            .then((response) {
                                expect(response).toEqual({
                                    'data': {
                                        'name': 'TestedDevice',
                                        'plugin': 'TestPlugin',
                                        'deviceClass': 'TestClass',
                                        'implementedInterfaces': ['TestInterface'],
                                        'variables': {},
                                        '_id': deviceIds.last
                                    },
                                    'status': 'success',
                                    'version': '0.0.0',
                                });
                            });
                    });
            });
        });

        describe('delete', () {

            it('should be able to delete devices', () {
                return http.delete('$HOST/rest/devices/${deviceIds.first}')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': 'Deletion of device succeeded',
                        'status': 'success',
                        'version': '0.0.0',
                    });
                })
                .then((_) =>
                    http.get('$HOST/rest/devices/')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': [{
                                'name': 'TestedDevice',
                                'plugin': 'TestPlugin',
                                'deviceClass': 'TestClass',
                                'implementedInterfaces': ['TestInterface'],
                                'variables': {},
                                '_id': deviceIds.last
                            }],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    })
                )
                .then((_) =>
                    http.delete('$HOST/rest/devices/${deviceIds.last}')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': 'Deletion of device succeeded',
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    })
                )
                .then((_) {
                    http.get('$HOST/rest/devices/')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': [],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    });
                });
            });
        });
    });
}
