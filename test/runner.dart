import 'tests/api/event.dart' as api_tests;
import 'tests/configuration/settings.dart' as configuration_settings_test;
import 'tests/device.dart' as device_tests;
import 'tests/interface.dart' as interface_tests;
import 'tests/plugin/manager.dart' as plugin_manager_test;
import 'tests/position.dart' as position_tests;

main() {
    api_tests.main();
    configuration_settings_test.main();
    device_tests.main();
    interface_tests.main();
    plugin_manager_test.main();
    position_tests.main();
}
