part of raxa.api;

/**
 * API endpoints for configuring interfaces
 */
class InterfaceManagerApi {
    RestServer restServer;
    InterfaceManager interfaceManager;

    InterfaceManagerApi(this.restServer, this.interfaceManager);

    /**
     * Initialize all routes for configuring interfaces
     */
    initialize() {
        restServer
            ..route(new Route('/rest/interfaces')
                ..get = getAllInterfaces)
            ..route(new Route('/rest/interfaces/{interface}')
                ..get = getInterface);
    }

    getAllInterfaces(Request request) =>
        interfaceManager.readAll().then((data) {
            return new RestResponse(data);
        });

    getInterface(Request request) {
        var interface = request.urlParameters['interface'];

        return interfaceManager.read(interface).then((data) {
            if (data == null) {
                request.httpRequest.response.statusCode = HttpStatus.NOT_FOUND;
                return new RestResponse('Interface not found', status: Status.FAIL);
            }

            return new RestResponse(data);
        });
    }
}
