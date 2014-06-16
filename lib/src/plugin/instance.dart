part of raxa.plugin;

const PLUGIN_API_VERSION = '0.0.0';

class PluginInstance {
    Future started;
    Isolate isolate;
    SendPort sendPort;

    PluginInstance(String pluginName) {
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
                    default:
                        sendPort.send(new ErrorMessage(
                            'Command "${message.command}" is not supported'));
                }
            } else {
                sendPort.send(new ErrorMessage('Messages must be a subtype of Message'));
            }
        });

        started = Isolate.spawnUri('plugins/$pluginName/main.dart',
                                   [PLUGIN_API_VERSION],
                                   receivePort.sendPort)
            .then((isolate) => this.isolate = isolate);
    }
}
