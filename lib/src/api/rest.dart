part of raxa.api;

class RestApi {
    Config config;
    RestServer restServer;
    SettingsApi settingsApi;

    RestApi(this.config, this.restServer, this.settingsApi);

    initialize() {
        settingsApi.initialize();

        restServer.start(address: config.restHostname, port: config.restPort);
    }
}

class RestModule extends Module {

    RestModule() {
        bind(RestServer, toValue: new RestServer());
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
