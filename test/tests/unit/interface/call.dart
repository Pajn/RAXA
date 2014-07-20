library interface_call_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/interface.dart';
import 'package:unittest/unittest.dart' hide expect;

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Call', () {
        it('should map all standard attributes', () {
            var call = new Call.from({
                'deviceId': 'SomeId',
                'interface': 'SomeInterface',
                'method': 'SomeMethod',
                'arguments': {
                    'argument': 'value'
                }
            });

            expect(call.deviceId).toEqual('SomeId');
            expect(call.interface).toEqual('SomeInterface');
            expect(call.method).toEqual('SomeMethod');
            expect(call.arguments).toEqual({'argument': 'value'});
        });

        it('should support undeclared attributes', () {
            var call = new Call.from({
                'someUndeclaredAttribute': 'SomeValue'
            });

            expect(call['someUndeclaredAttribute']).toEqual('SomeValue');
        });

        it('should behave like a map', () {
            var call = new Call.from({
                'deviceId': 'SomeId',
                'interface': 'SomeInterface',
                'method': 'SomeMethod',
                'arguments': {
                    'argument': 'value'
                },
                'someUndeclaredAttribute': 'SomeValue'
            });

            expect(call).toEqual({
                'deviceId': 'SomeId',
                'interface': 'SomeInterface',
                'method': 'SomeMethod',
                'arguments': {
                    'argument': 'value'
                },
                'someUndeclaredAttribute': 'SomeValue'
            });
        });
    });
}
