part of raxa.api;

class EventApi {
    StreamController _local = new StreamController.broadcast();
    Stream get local => _local.stream;

    EventApi();

    initialize() {
    }

    broadcast(EventMessage event) {
        _local.add(event);
        print(event);
    }
}
