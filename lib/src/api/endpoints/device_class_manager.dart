part of raxa.api;

/**
 * API endpoints for configuring [DeviceClass]es.
 */
class DeviceClassManagerApi {
    RestServer restServer;
    DeviceClassManager deviceClassManager;

    DeviceClassManagerApi(this.restServer, this.deviceClassManager);

    /**
     * Initialize all routes for configuring [DeviceClass]es.
     */
    initialize() {
        restServer
            ..route(new Route('/rest/deviceclasses')
                ..get = getAllDeviceClasses)
            ..route(new Route('/rest/deviceclasses/{plugin}')
                ..get = getAllDeviceClasses)
            ..route(new Route('/rest/deviceclasses/{plugin}/{name}')
                ..get = getDeviceClass);
    }

    getAllDeviceClasses(Request request) {
        var query = request.httpRequest.uri.queryParameters['query'];
        query = query != null ? JSON.decode(query) : {};

        var plugin = request.urlParameters['plugin'];
        if (plugin != null) {
            query['plugin'] = plugin;
        }

        return deviceClassManager.readAll(query).then((data) {
            return new RestResponse(data);
        });
    }

    getDeviceClass(Request request) {
        var plugin = request.urlParameters['plugin'];
        var name = request.urlParameters['name'];

        return deviceClassManager.read(plugin, name).then((data) {
            if (data == null) {
                request.httpRequest.response.statusCode = HttpStatus.NOT_FOUND;
                return new RestResponse('DeviceClass not found', status: Status.FAIL);
            }

            return new RestResponse(data);
        });
    }
}
