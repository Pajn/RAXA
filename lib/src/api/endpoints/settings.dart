part of raxa.api;

/**
 * API endpoints for configuring settings
 */
class SettingsApi {
    RestServer restServer;
    Settings settings;

    SettingsApi(this.restServer, this.settings);

    /**
     * Initialize all routes for configuring settings
     */
    initialize() {
        restServer
            ..route(new Route('/settings')
                ..get = getAllSettings)
            ..route(new Route('/settings/{group}')
                ..get = getSettings
                ..put = putSettings);
    }

    getAllSettings(Request request) {
        return settings.readAll().then((data) {
            print(data);
            return new RestResponse(data);
        });
    }

    getSettings(Request request) {
        var group = request.urlParameters['group'];
        return settings.read(group).then((data) {
            if (data == null) {
                request.httpRequest.response.statusCode = HttpStatus.NOT_FOUND;
                return new RestResponse('Group "$group" not found', status: Status.FAIL);
            }

            return new RestResponse(data);
        });
    }

    putSettings(Request request) {
        var group = request.urlParameters['group'];
        return settings.save(request.json, group).then((data) {
            if (data['err'] != null) {
                return new RestResponse('Update of group "$group" failed', status: Status.FAIL);
            }

            return new RestResponse('Update of group "$group" succeeded');
        });
    }
}
