part of raxa.api;

/**
 * API endpoints for configuring [Device]s.
 */
class DeviceManagerApi {
    RestServer restServer;
    DeviceManager deviceManager;

    DeviceManagerApi(this.restServer, this.deviceManager);

    /**
     * Initialize all routes for configuring [Device]s.
     */
    initialize() {
        restServer
            ..route(new Route('/devices')
                ..get = getAllDevices
                ..post = postDevice)
            ..route(new Route('/devices/{id}')
                ..delete = deleteDevice
                ..get = getDevice
                ..put = putDevice);
    }

    getAllDevices(Request request) =>
        deviceManager.readAll().then((data) {
            return new RestResponse(data);
        });

    postDevice(Request request) {
        var device = new Device.from(request.json);

        return deviceManager.create(device).then((data) {
            if (data['err'] != null) {
                return new RestResponse('Creation of device failed', status: Status.FAIL);
            }

            return new RestResponse('Creation of device succeeded');
        });
    }

    deleteDevice(Request request) {
        var device = request.urlParameters['id'];

        return deviceManager.delete(device).then((data) {
            if (data['err'] != null) {
                return new RestResponse('Deletion of device failed', status: Status.FAIL);
            }

            return new RestResponse('Deletion of device succeeded');
        });
    }

    getDevice(Request request) {
        var device = request.urlParameters['id'];

        return deviceManager.read(device).then((data) {
            if (data == null) {
                request.httpRequest.response.statusCode = HttpStatus.NOT_FOUND;
                return new RestResponse('Device not found', status: Status.FAIL);
            }

            return new RestResponse(data);
        });
    }

    putDevice(Request request) {
        var device = request.urlParameters['id'];

        return deviceManager.update(request.json, device).then((data) {
            if (data['err'] != null) {
                return new RestResponse('Update of device failed', status: Status.FAIL);
            }

            return new RestResponse('Update of device succeeded');
        });
    }
}
