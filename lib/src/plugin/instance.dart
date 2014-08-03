part of raxa.plugin;

const PLUGIN_API_VERSION = '0.0.0';

class PluginInstance {
    var _onPluginEvent = new StreamController();

    Future started;
    Isolate isolate;
    SendPort sendPort;

    Stream<PluginEventMessage> get onPluginEvent => _onPluginEvent.stream;

    PluginInstance(String pluginFolderPath, String pluginName) {
        var receivePort = new ReceivePort();

        receivePort.listen((message) {
            if (message is SendPort) {
                sendPort = message;
            } else if (sendPort == null) {
                // Ignore everything until we get a SendPort
                return;
            } else if (message is Map && message.containsKey('command')) {
                message = new Message.from(message);
                switch (message.command) {
                    case 'PluginEvent':
                        _onPluginEvent.add(new PluginEventMessage.from(message));
                        break;
                    default:
                        sendPort.send(new ErrorMessage(
                            'Command "${message.command}" is not supported'));
                }
            } else {
                sendPort.send(new ErrorMessage('Messages must be a subtype of Message'));
            }
        });

        started = Isolate.spawnUri(new Uri.file('$pluginFolderPath/$pluginName/main.dart'),
                                   [PLUGIN_API_VERSION],
                                   receivePort.sendPort)
            .then((isolate) => this.isolate = isolate);
    }

    send(Message message) {
        if (sendPort is SendPort) {
            // Go through JSON to make sure we only have supported object types
            sendPort.send(JSON.decode(JSON.encode(message)));
        }
    }
}
