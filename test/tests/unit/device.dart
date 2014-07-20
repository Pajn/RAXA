library device_tests;

import 'package:guinness/guinness.dart';

import 'device/class.dart' as device_class_test;
import 'device/class_manager.dart' as device_class_manager_test;
import 'device/device.dart' as device_device_test;
import 'device/manager.dart' as device_manager_test;

main() {
    describe('Device', () {
        device_class_test.main();
        device_class_manager_test.main();
        device_device_test.main();
        device_manager_test.main();
    });
}
