import 'tests/unit/api/event.dart' as api_tests;
import 'tests/unit/configuration/settings.dart' as configuration_settings_test;
import 'tests/unit/device.dart' as device_tests;
import 'tests/unit/interface.dart' as interface_tests;
import 'tests/unit/plugin/manager.dart' as plugin_manager_test;
import 'tests/unit/position.dart' as position_tests;

main() {
    api_tests.main();
    configuration_settings_test.main();
    device_tests.main();
    interface_tests.main();
    plugin_manager_test.main();
    position_tests.main();
}
