part of raxa_web;

@Injectable()
class ModelService {
    final RestService restService;
    final WebSocketService webSocketService;

    List<Device> _devices;
    List<DeviceClass> _deviceClasses;

    List<Device> get devices {
        if (_devices == null) {
            _devices = new List<Device>();

            restService.getDevices().then((devices) => _devices.addAll(devices));
        }

        return _devices;
    }

    List<DeviceClass> get deviceClasses {
        if (_deviceClasses == null) {
            _deviceClasses = new List<DeviceClass>();

            restService.getDeviceClasses().then((classes) => _deviceClasses.addAll(classes));
        }

        return _deviceClasses;
    }

    ModelService(this.restService, this.webSocketService) {
        webSocketService.onEvent.listen((message) {
            switch (message.type) {
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
                case 'DeviceClass':
                    switch (message.event) {
                        case 'installed':
                            deviceClasses.add(new DeviceClass.from(message.data));
                            break;
                    }
                    break;
            }
        });
    }
}
