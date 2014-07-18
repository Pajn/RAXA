library position_tests;

import 'package:guinness/guinness.dart';

import 'position/position.dart' as position_test;
import 'position/manager.dart' as manager_test;

main() {
    describe('Position', () {
        position_test.main();
        manager_test.main();
    });
}
