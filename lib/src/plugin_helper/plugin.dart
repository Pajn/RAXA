part of raxa.plugin_helper;

class Plugin {
    ReceivePort receivePort = new ReceivePort();

    var _onCalled = new StreamController();
    Stream<CallMessage> get onCalled => _onCalled.stream;

    Plugin(List<String> args, SendPort sendPort) {
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
}
