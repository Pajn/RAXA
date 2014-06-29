part of raxa.api;

class RestApi {
    Config config;
    RestServer restServer;

    CallApi callApi;
    DeviceClassManagerApi deviceClassManagerApi;
    DeviceManagerApi deviceManagerApi;
    PluginManagerApi pluginManagerApi;
    SettingsApi settingsApi;

    RestApi(this.config, this.restServer, this.callApi, this.deviceClassManagerApi,
            this.deviceManagerApi, this.pluginManagerApi, this.settingsApi);

    initialize() {
        callApi.initialize();
        deviceClassManagerApi.initialize();
        deviceManagerApi.initialize();
        pluginManagerApi.initialize();
        settingsApi.initialize();

        restServer.static('../web', jailRoot: false);
        restServer.clientRoutes = [
            '/settings/devices', '/settings'
        ];
        restServer.start(address: config.restHostname, port: config.restPort);
    }
}

class RestModule extends Module {

    RestModule() {
        install(new DeviceModule());
        install(new PluginModule());
        bind(RestServer);
        bind(CallApi);
        bind(DeviceClassManagerApi);
        bind(DeviceManagerApi);
        bind(PluginManagerApi);
        bind(SettingsApi);
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
