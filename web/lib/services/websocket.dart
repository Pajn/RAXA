part of raxa_web;

@Injectable()
class WebSocketService {
    final Http http;

    var _onEvent = new StreamController.broadcast();
    var _onPluginEvent = new StreamController.broadcast();
    Stream<EventMessage> get onEvent => _onEvent.stream;
    Stream<EventMessage> get onPluginEvent => _onPluginEvent.stream;

    WebSocketService(this.http) {
        WebSocket ws = new WebSocket('ws://127.0.0.1:8080/ws');
        ws.onOpen.listen((Event e) {
            print('Connected to server');
        });

        ws.onMessage.listen((MessageEvent e) {
            print(e.data);
            try {
                var message = new Message.from(JSON.decode(e.data));
                
                switch (message.command) {
                    case 'Event':
                        _onEvent.add(new EventMessage.from(message));
                        break;
                    case 'PluginEvent':
                        _onPluginEvent.add(new PluginEventMessage.from(message));
                        break;
                }
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
