library raxa.api;

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:di/di.dart';
import 'package:raxa/common.dart';
import 'package:raxa/configuration.dart';
import 'package:raxa/device.dart';
import 'package:raxa/plugin.dart';
import 'package:raxa/position.dart';
import 'package:RestLibrary/restlibrary.dart';

part 'src/api/version.dart';
part 'src/api/event.dart';
part 'src/api/rest.dart';
part 'src/api/websocket.dart';
part 'src/api/endpoints/call.dart';
part 'src/api/endpoints/device_class_manager.dart';
part 'src/api/endpoints/device_manager.dart';
part 'src/api/endpoints/plugin_manager.dart';
part 'src/api/endpoints/position_manager.dart';
part 'src/api/endpoints/settings.dart';


class ApiModule extends Module {

    ApiModule() {
        install(new RestModule());
        bind(EventBus);
    }
}
