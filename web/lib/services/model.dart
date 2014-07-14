part of raxa_web;

@Injectable()
class ModelService {
    final RestService restService;

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

    ModelService(this.restService);
}
