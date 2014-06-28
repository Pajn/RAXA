part of raxa.plugin_helper;

class Plugin {
    ReceivePort receivePort = new ReceivePort();
    SendPort sendPort;

    var _onCalled = new StreamController();
    Stream<CallMessage> get onCalled => _onCalled.stream;

    Plugin(List<String> args, this.sendPort) {
        receivePort.listen((message) {
            message = new Message.from(message);

            switch (message.command) {
                case 'Call':
                    _onCalled.add(new CallMessage.from(message));
                    break;
            }
        });

        sendPort.send(receivePort.sendPort);
    }

    send(Message message) => sendPort.send(message);
}
