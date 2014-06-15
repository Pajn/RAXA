import 'tests/configuration/settings.dart' as configuration_settings_test;
import 'tests/device.dart' as device_tests;
import 'tests/interface.dart' as interface_tests;
import 'tests/plugin/manager.dart' as plugin_manager_test;

main() {
    configuration_settings_test.main();
    device_tests.main();
    interface_tests.main();
    plugin_manager_test.main();
}
