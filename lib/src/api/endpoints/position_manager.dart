part of raxa.api;

/**
 * API endpoints for configuring [Position]s.
 */
class PositionManagerApi {
    RestServer restServer;
    PositionManager positionManager;

    PositionManagerApi(this.restServer, this.positionManager);

    /**
     * Initialize all routes for configuring [Position]s.
     */
    initialize() {
        restServer
            ..route(new Route('/rest/positions')
                ..get = getAllPositions
                ..post = postPosition)
            ..route(new Route('/rest/positions/{id}')
                ..delete = deletePosition
                ..get = getPosition
                ..put = putPosition);
    }

    getAllPositions(Request request) {
        var query = request.httpRequest.uri.queryParameters['query'];
        query = query != null ? JSON.decode(query) : {};

        return positionManager.readAll(query).then((data) {
            return new RestResponse(data);
        });
    }

    postPosition(Request request) {
        var position = new Position.from(request.json);

        return positionManager.create(position).then((data) =>
            new RestResponse('Creation of position succeeded')
        ).catchError((_) => new RestResponse('Creation of position failed', status: Status.FAIL));
    }

    deletePosition(Request request) {
        var position = request.urlParameters['id'];

        return positionManager.delete(position).then((data) =>
            new RestResponse('Deletion of position succeeded')
        ).catchError((_) => new RestResponse('Deletion of position failed', status: Status.FAIL));
    }

    getPosition(Request request) {
        var position = request.urlParameters['id'];

        return positionManager.read(position).then((data) {
            if (data == null) {
                request.httpRequest.response.statusCode = HttpStatus.NOT_FOUND;
                return new RestResponse('Position not found', status: Status.FAIL);
            }

            return new RestResponse(data);
        });
    }

    putPosition(Request request) {
        var position = request.urlParameters['id'];

        return positionManager.update(request.json, position)
            .then((data) => new RestResponse('Update of position succeeded'))
            .catchError((_) => new RestResponse('Update of position failed', status: Status.FAIL));
    }
}
