part of raxa.plugin_helper;

class Plugin {
    ReceivePort receivePort = new ReceivePort();
    SendPort sendPort;

    var _onCalled = new StreamController();
    var _onEvent = new StreamController();
    var _onPluginEvent = new StreamController();
    Stream<CallMessage> get onCalled => _onCalled.stream;
    Stream<EventMessage> get onEvent => _onEvent.stream;
    Stream<PluginEventMessage> get onPluginEvent => _onPluginEvent.stream;

    Plugin(List<String> args, this.sendPort) {
        receivePort.listen((message) {
            message = new Message.from(message);

            switch (message.command) {
                case 'Call':
                    _onCalled.add(new CallMessage.from(message));
                    break;
                case 'Event':
                    _onEvent.add(new EventMessage.from(message));
                    break;
                case 'PluginEvent':
                    _onPluginEvent.add(new PluginEventMessage.from(message));
                    break;
            }
        });

        sendPort.send(receivePort.sendPort);
    }

    send(Message message) => sendPort.send(message);
}
