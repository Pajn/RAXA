library raxa.position;

import 'dart:async';
import 'package:di/di.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:raxa/api.dart';
import 'package:raxa/common.dart';
import 'package:raxa/configuration.dart';

export 'package:raxa/common.dart' show Position;

part 'src/position/manager.dart';

class PositionModule extends Module {

    PositionModule() {
        bind(PositionManager);
    }
}
