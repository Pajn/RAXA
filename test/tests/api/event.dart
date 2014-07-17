library api_event_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/api.dart';
import 'package:raxa/common.dart';
import 'package:unittest/unittest.dart' hide expect;

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Api/EventBus', () {
        EventBus bus;

        beforeEach(() {
            bus = new EventBus();
        });

        it('should broadcast the events to its listeners', () {
            var testMessage = new EventMessage('Test', 'testing', 1);

            bus.listen(expectAsync((message) {
                expect(message).toEqual(testMessage);
            }, count: 2));

            bus.add(testMessage);

            bus.listen(expectAsync((message) {
                expect(message).toEqual(testMessage);
            }));

            bus.add(testMessage);
        });
    });
}
