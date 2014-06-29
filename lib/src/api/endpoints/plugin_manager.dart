part of raxa.api;

/**
 * API endpoints for configuring plugins
 */
class PluginManagerApi {
    RestServer restServer;
    PluginManager pluginManager;

    PluginManagerApi(this.restServer, this.pluginManager);

    /**
     * Initialize all routes for configuring plugins
     */
    initialize() {
        restServer
            ..route(new Route('/rest/plugins')
                ..get = getAllPlugins)
            ..route(new Route('/rest/plugins/{plugin}')
                ..get = getPlugin
                ..put = putPlugin);
    }

    getAllPlugins(Request request) =>
        pluginManager.readAll().then((data) {
            return new RestResponse(data);
        });

    getPlugin(Request request) {
        var plugin = request.urlParameters['plugin'];

        return pluginManager.read(plugin).then((data) {
            if (data == null) {
                request.httpRequest.response.statusCode = HttpStatus.NOT_FOUND;
                return new RestResponse('Plugin "$plugin" not found', status: Status.FAIL);
            }

            return new RestResponse(data);
        });
    }

    putPlugin(Request request) {
        var plugin = request.urlParameters['plugin'];

        if (request.json.keys.length == 1 && request.json.keys.first == 'enabled') {
            if (request.json.keys['enabled']) {
                pluginManager.read(plugin).then((plugin) => pluginManager.enable(plugin));
            } else {
                pluginManager.read(plugin).then((plugin) => pluginManager.disable(plugin));
            }
        }

        request.httpRequest.response.statusCode = HttpStatus.BAD_REQUEST;
        return new RestResponse('Only the enabled parameter may be changed', status: Status.ERROR);
    }
}
