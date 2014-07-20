library device_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/common.dart';
import 'package:unittest/unittest.dart' hide expect;

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Device', () {
        it('should map all standard attributes', () {
            var device = new Device.from({
                '_id': 'SomeId',
                'name': 'SomeName',
                'plugin': 'SomePlugin',
                'deviceClass': 'SomeClass',
                'config': {
                    'someParameter': 'someValue'
                },
                'implementedInterfaces': ['SomeInterface'],
                'status': {
                    'someStatus': 'someValue'
                },
                'variables': {
                    'someVariable': 'someValue'
                },
            });

            expect(device.id).toEqual('SomeId');
            expect(device.name).toEqual('SomeName');
            expect(device.plugin).toEqual('SomePlugin');
            expect(device.deviceClass).toEqual('SomeClass');

            expect(device.config).toEqual({'someParameter': 'someValue'});
            expect(device.implementedInterfaces).toEqual(['SomeInterface']);
            expect(device.status).toEqual({'someStatus': 'someValue'});
            expect(device.variables).toEqual({'someVariable': 'someValue'});
        });

        it('should support undeclared attributes', () {
            var device = new Device.from({
                'someUndeclaredAttribute': 'SomeValue'
            });

            expect(device['someUndeclaredAttribute']).toEqual('SomeValue');
        });

        it('should behave like a map', () {
            var device = new Device.from({
                '_id': 'SomeId',
                'name': 'SomeName',
                'plugin': 'SomePlugin',
                'deviceClass': 'SomeClass',
                'config': {
                    'someParameter': 'someValue'
                },
                'implementedInterfaces': ['SomeInterface'],
                'status': {
                    'someStatus': 'someValue'
                },
                'variables': {
                    'someVariable': 'someValue'
                },
                'someUndeclaredAttribute': 'SomeValue'
            });

            expect(device).toEqual({
                '_id': 'SomeId',
                'name': 'SomeName',
                'plugin': 'SomePlugin',
                'deviceClass': 'SomeClass',
                'config': {
                    'someParameter': 'someValue'
                },
                'implementedInterfaces': ['SomeInterface'],
                'status': {
                    'someStatus': 'someValue'
                },
                'variables': {
                    'someVariable': 'someValue'
                },
                'someUndeclaredAttribute': 'SomeValue'
            });
        });
    });
}
