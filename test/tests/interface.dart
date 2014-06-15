library interface_tests;

import 'package:guinness/guinness.dart';

import 'interface/call.dart' as interface_call_test;
import 'interface/manager.dart' as interface_manager_test;

main() {
    describe('Interface', () {
        interface_call_test.main();
        interface_manager_test.main();
    });
}
