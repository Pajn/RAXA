part of raxa_web;

@Injectable()
class WebSocketService {
    final Http http;

    var _onEvent = new StreamController.broadcast();
    Stream<EventMessage> get onEvent => _onEvent.stream;

    WebSocketService(this.http) {
        WebSocket ws = new WebSocket('ws://127.0.0.1:8080/ws');
        ws.onOpen.listen((Event e) {
            print('Connected to server');
        });

        ws.onMessage.listen((MessageEvent e) {
            print(e.data);
            try {
                _onEvent.add(new EventMessage.from(JSON.decode(e.data)));
            } catch (e) {
                // Bad message, just let it drop.
                return;
            }
        });

        ws.onClose.listen((Event e) {
            print('Connection to server lost...');
        });
    }
}
