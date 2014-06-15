library class_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/device.dart';
import 'package:unittest/unittest.dart' hide expect;

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('DeviceClass', () {
        it('should map all standard attributes', () {
            var deviceClass = new DeviceClass.from({
                'name': 'SomeName',
                'plugin': 'SomePlugin',
                'config': {
                    'someParameter': 'someValue'
                },
                'implementedInterfaces': ['SomeInterface'],
                'requiredInterfaces': ['SomeOtherInterface'],
            });

            expect(deviceClass.name).toEqual('SomeName');
            expect(deviceClass.plugin).toEqual('SomePlugin');

            expect(deviceClass.config).toEqual({'someParameter': 'someValue'});
            expect(deviceClass.implementedInterfaces).toEqual(['SomeInterface']);
            expect(deviceClass.requiredInterfaces).toEqual(['SomeOtherInterface']);
        });

        it('should support undeclared attributes', () {
            var deviceClass = new DeviceClass.from({
                'someUndeclaredAttribute': 'SomeValue'
            });

            expect(deviceClass['someUndeclaredAttribute']).toEqual('SomeValue');
        });

        it('should behave like a map', () {
            var deviceClass = new DeviceClass.from({
                'name': 'SomeName',
                'plugin': 'SomePlugin',
                'config': {
                    'someParameter': 'someValue'
                },
                'implementedInterfaces': ['SomeInterface'],
                'requiredInterfaces': ['SomeOtherInterface'],
                'someUndeclaredAttribute': 'SomeValue'
            });

            expect(deviceClass).toEqual({
                'name': 'SomeName',
                'plugin': 'SomePlugin',
                'config': {
                    'someParameter': 'someValue'
                },
                'implementedInterfaces': ['SomeInterface'],
                'requiredInterfaces': ['SomeOtherInterface'],
                'someUndeclaredAttribute': 'SomeValue'
            });
        });
    });
}
