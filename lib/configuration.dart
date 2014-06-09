library raxa.configuration;

import 'dart:async';
import 'dart:io';
import 'package:di/di.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:yaml/yaml.dart';

part 'src/configuration/config.dart';
part 'src/configuration/database.dart';
part 'src/configuration/settings.dart';


class ConfigurationModule extends Module {

    ConfigurationModule() {
        bind(Config);
        bind(Database);
        bind(Settings);
    }
}
