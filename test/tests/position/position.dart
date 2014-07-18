library position_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/common.dart';
import 'package:unittest/unittest.dart' hide expect;

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Position', () {
        it('should map all standard attributes', () {
            var position = new Position.from({
                '_id': 'SomeId',
                'name': 'SomeName',
                'parent': 'SomeParent',
            });

            expect(position.id).toEqual('SomeId');
            expect(position.name).toEqual('SomeName');
            expect(position.parent).toEqual('SomeParent');
        });

        it('should support undeclared attributes', () {
            var position = new Position.from({
                'someUndeclaredAttribute': 'SomeValue'
            });

            expect(position['someUndeclaredAttribute']).toEqual('SomeValue');
        });

        it('should behave like a map', () {
            var position = new Position.from({
                '_id': 'SomeId',
                'name': 'SomeName',
                'parent': 'SomeParent',
                'someUndeclaredAttribute': 'SomeValue',
            });

            expect(position).toEqual({
                '_id': 'SomeId',
                'name': 'SomeName',
                'parent': 'SomeParent',
                'someUndeclaredAttribute': 'SomeValue',
            });
        });
    });
}
