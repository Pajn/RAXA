library event_helpers;

import 'package:guinness/guinness.dart';
import 'package:raxa/api.dart';

class MockEventBus extends EventBus {
    SpyFunction addSpy = guinness.createSpy('addSpy');

    add(message) => addSpy(message);

    // Ignore warnings about unimplemented methods
    noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
