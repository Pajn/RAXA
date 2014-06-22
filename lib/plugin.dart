library raxa.plugin;

import 'dart:async';
import 'dart:io';
import 'dart:isolate';
import 'package:di/di.dart';
import 'package:raxa/common.dart';
import 'package:raxa/configuration.dart';
import 'package:raxa/device.dart';
import 'package:raxa/interface.dart';
import 'package:raxa/plugin_helper.dart';
import 'package:yaml/yaml.dart';

part 'src/plugin/directory.dart';
part 'src/plugin/instance.dart';
part 'src/plugin/manager.dart';
part 'src/plugin/plugin.dart';


class PluginModule extends Module {

    PluginModule() {
        bind(PluginManager);
    }
}
