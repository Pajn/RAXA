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
            ..route(new Route('/deviceclasses')
                ..get = getAllDeviceClasses)
            ..route(new Route('/deviceclasses/{deviceClass}')
                ..get = getAllDeviceClasses)
            ..route(new Route('/deviceclasses/{deviceClass}/{name}')
                ..get = getDeviceClass);
    }

    getAllDeviceClasses(Request request) {
        var deviceClass = request.urlParameters['deviceClass'];
        var query = {};
        if (deviceClass != null) {
            query['deviceClass'] = deviceClass;
        }

        return deviceClassManager.readAll(query).then((data) {
            return new RestResponse(data);
        });
    }

    getDeviceClass(Request request) {
        var deviceClass = request.urlParameters['deviceClass'];
        var name = request.urlParameters['name'];

        return deviceClassManager.read(deviceClass, name).then((data) {
            if (data == null) {
                request.httpRequest.response.statusCode = HttpStatus.NOT_FOUND;
                return new RestResponse('DeviceClass not found', status: Status.FAIL);
            }

            return new RestResponse(data);
        });
    }
}
