part of raxa.api;

class RestApi {
    Config config;
    RestServer restServer;
    WebSocketApi webSocketApi;

    CallApi callApi;
    DeviceClassManagerApi deviceClassManagerApi;
    DeviceManagerApi deviceManagerApi;
    InterfaceManagerApi interfaceManagerApi;
    PluginManagerApi pluginManagerApi;
    PositionManagerApi positionManagerApi;
    SettingsApi settingsApi;

    RestApi(this.config, this.restServer, this.webSocketApi, this.callApi,
            this.deviceClassManagerApi, this.deviceManagerApi, this.interfaceManagerApi,
            this.pluginManagerApi, this.positionManagerApi, this.settingsApi);

    initialize() {
        callApi.initialize();
        deviceClassManagerApi.initialize();
        deviceManagerApi.initialize();
        interfaceManagerApi.initialize();
        pluginManagerApi.initialize();
        positionManagerApi.initialize();
        settingsApi.initialize();

        restServer.static('../web', jailRoot: false);
        restServer.clientRoutes = [
            '/settings/actions', '/settings/devices', '/settings/positions', '/settings/scenarios', '/settings'
        ];

        HttpServer.bind(config.restHostname, config.restPort).then((server) {
            server.listen((HttpRequest request) {
                if (request.uri.path == '/ws' && WebSocketTransformer.isUpgradeRequest(request)) {
                    WebSocketTransformer.upgrade(request).then(webSocketApi.upgrade);
                } else {
                    restServer.handle(request);
                }
            });
        });
    }
}

class RestModule extends Module {

    RestModule() {
        install(new DeviceModule());
        install(new PluginModule());
        install(new PositionModule());
        bind(RestServer);
        bind(CallApi);
        bind(DeviceClassManagerApi);
        bind(DeviceManagerApi);
        bind(InterfaceManagerApi);
        bind(PluginManagerApi);
        bind(PositionManagerApi);
        bind(SettingsApi);
        bind(WebSocketApi);
        bind(RestApi);
    }
}

/**
 * A wrapper for [Response] that adds the api version to the response.
 */
class RestResponse extends Response {

    RestResponse(data, {Status status: Status.SUCCESS}) : super(data, status: status);

    /// Returns a JSON representation of the response.
    String toString() {
        if (status == Status.ERROR) {
            return JSON.encode({
                'status': status.value,
                'message': data,
                'version': API_VERSION
            });
        } else {
            return JSON.encode({
                'data': data,
                'status': status.value,
                'version': API_VERSION
            });
        }
    }
}
