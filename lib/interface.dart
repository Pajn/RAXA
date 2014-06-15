library raxa.interface;

import 'dart:async';
import 'package:di/di.dart';
import 'package:raxa/common.dart';
import 'package:raxa/configuration.dart';
import 'package:raxa/device.dart';

part 'src/interface/call.dart';
part 'src/interface/interface.dart';
part 'src/interface/manager.dart';


class InterfaceModule extends Module {

    InterfaceModule() {
        bind(InterfaceManager);
    }
}
