part of raxa.api;

/**
 * API endpoints for calling.
 */
class CallApi {
    RestServer restServer;
    DeviceManager deviceManager;
    PluginManager pluginManager;

    CallApi(this.restServer, this.deviceManager, this.pluginManager);

    initialize() {
        restServer
            ..route(new Route('/call')
                ..post = call);
    }

    call(Request request) {
        var call = new Call.from(request.json);
        print('call');

        return deviceManager.read(call.deviceId).then((device) {
            pluginManager.call(call, device);

            return new RestResponse('Call executed');
        });
    }
}
