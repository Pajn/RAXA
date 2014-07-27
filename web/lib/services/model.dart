part of raxa_web;

@Injectable()
class ModelService {
    final RestService restService;
    final WebSocketService webSocketService;

    List<DeviceClass> _deviceClasses;
    List<Device> _devices;
    List<Position> _positions;
    List<Interface> _interfaces;
    List<DeviceClass> _scenarioClasses;
    List<Device> _scenarios;

    List<DeviceClass> get deviceClasses {
        if (_deviceClasses == null) {
            _deviceClasses = new List<DeviceClass>();

            restService.getDeviceClasses().then((classes) =>
                _deviceClasses.addAll(classes.map((deviceClass) =>
                    new DeviceClass.from(deviceClass))));
        }

        return _deviceClasses;
    }

    List<Device> get devices {
        if (_devices == null) {
            _devices = new List<Device>();

            restService.getDevices().then((devices) =>
                _devices.addAll(devices.map((device) => new Device.from(device))));
        }

        return _devices;
    }

    List<Interface> get interfaces {
        if (_interfaces == null) {
            _interfaces = new List<Interface>();

            restService.getInterfaces().then((interfaces) =>
                _interfaces.addAll(interfaces.map((interface) => new Interface.from(interface))));
        }

        return _interfaces;
    }

    List<Position> get positions {
        if (_positions == null) {
            _positions = new List<Position>();

            restService.getPositions().then((positions) =>
                _positions.addAll(positions.map((position) => new Position.from(position))));
        }

        return _positions;
    }

    List<DeviceClass> get scenarioClasses {
        if (_scenarioClasses == null) {
            _scenarioClasses = new List<DeviceClass>();

            restService.getScenarioClasses().then((classes) =>
                _scenarioClasses.addAll(classes.map((deviceClass) {
                    print(deviceClass);
                    return new DeviceClass.from(deviceClass);
                })));
        }

        return _scenarioClasses;
    }

    List<Device> get scenarios {
        if (_scenarios == null) {
            _scenarios = new List<Device>();

            restService.getScenarios().then((devices) =>
                _scenarios.addAll(devices.map((device) => new Device.from(device))));
        }

        return _scenarios;
    }

    ModelService(this.restService, this.webSocketService) {
        webSocketService.onEvent.listen((message) {
            switch (message.type) {
                case 'DeviceClass':
                    switch (message.event) {
                        case 'installed':
                            deviceClasses.add(new DeviceClass.from(message.data));
                            break;
                    }
                    break;
                case 'Device':
                    switch (message.event) {
                        case 'created':
                            devices.add(new Device.from(message.data));
                            break;
                        case 'deleted':
                            devices.removeWhere((device) => device.id == message.data);
                            break;
                        case 'updated':
                            devices.firstWhere((device) => device.id == message.data['id'])
                                .addAll(message.data['changed']);
                            break;
                    }
                    break;
                case 'Position':
                    switch (message.event) {
                        case 'created':
                            positions.add(new Position.from(message.data));
                            break;
                        case 'deleted':
                            positions.removeWhere((position) => position.id == message.data);
                            break;
                        case 'updated':
                            positions.firstWhere((position) => position.id == message.data['id'])
                                .addAll(message.data['changed']);
                            break;
                    }
                    break;
            }
        });
    }
}
