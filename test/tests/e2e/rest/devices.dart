library rest_devices_test;

import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:guinness/guinness.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../runner.dart';

main() {
    describe('Devices', () {

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
    });
}
