library event_helpers;

import 'dart:async';
import 'package:guinness/guinness.dart';
import 'package:mock/mock.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:raxa/api.dart';

class MockEventBus extends EventBus {
    SpyFunction addSpy = guinness.createSpy('addSpy');

    add(message) => addSpy(message);

    // Ignore warnings about unimplemented methods
    noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
