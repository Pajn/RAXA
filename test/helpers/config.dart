library configuration_helpers;

import 'package:raxa/configuration.dart';

class MockConfig implements Config {
    var configPath;

    MockConfig();

    String get dbString => '';

    String get pluginFolderPath => '';

    String get restHostname => '';
    int get restPort => 0;
}
