import 'dart:io';
import 'package:args/args.dart';
import 'package:di/auto_injector.dart';
import 'package:raxa/api.dart';
import 'package:raxa/configuration.dart';
import 'package:raxa/device.dart';
import 'package:raxa/interface.dart';

main(arguments) {
    var parser = new ArgParser()
        ..addOption('config-file', abbr: 'c', help: 'Path to the configuration file')
        ..addFlag('help', abbr: 'h', negatable: false, help: 'Display this help text and exit');
    var results = parser.parse(arguments);

    if (results['help']) {
        print(parser.getUsage());
        exit(0);
    }

    var injector = defaultInjector(modules: [
        new ConfigurationModule()..bind(ArgResults, toValue: results),
        new InterfaceModule(),
        new ApiModule()
    ]);

    injector.get(RestApi).initialize();
}
