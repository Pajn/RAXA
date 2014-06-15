library raxa.plugin;

import 'dart:async';
import 'package:di/di.dart';
import 'package:raxa/configuration.dart';

part 'src/plugin/manager.dart';


class PluginModule extends Module {

    PluginModule() {
        bind(PluginManager);
    }
}
