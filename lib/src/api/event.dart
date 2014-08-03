part of raxa.api;

/**
 * A simple EventBus that broadcasts all events to it's listeners.
 */
class EventBus extends StreamView<Message> {
    static final _streamController = new StreamController<Message>.broadcast();

    EventBus() : super(_streamController.stream);

    add(EventMessage event) {
        _streamController.add(event);
        print(event);
    }
}
