part of raxa_web;

@Injectable()
class ModelService {
    final RestService restService;

    List<Device> _devices;

    List<Device> get devices {
        if (_devices == null) {
            _devices = new List<Device>();

            restService.getDevices().then((devices) => _devices.addAll(devices));
        }

        return _devices;
    }

    ModelService(this.restService);
}
