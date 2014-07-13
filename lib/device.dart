library raxa.device;

import 'dart:async';
import 'package:di/di.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:raxa/api.dart';
import 'package:raxa/common.dart';
import 'package:raxa/configuration.dart';

export 'package:raxa/common.dart' show Device;

part 'src/device/class_manager.dart';
part 'src/device/manager.dart';

class DeviceModule extends Module {

    DeviceModule() {
        bind(DeviceClassManager);
        bind(DeviceManager);
    }
}
