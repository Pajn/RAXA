part of raxa_web;

@Component(
    selector: 'device-create',
    templateUrl: 'lib/components/settings/device/create_device.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {'classes': '=>classes'}
)
class DeviceCreateComponent {
    final RestService restService;

    Device device = new Device();
    List<DeviceClass> classes = [];

    DeviceClass _deviceClass;

    get deviceClass => _deviceClass;
    set deviceClass(value) {
        _deviceClass = value;
        _deviceClass.validateDevice(device);
        device.deviceClass = deviceClass.name;
        device.plugin = deviceClass.plugin;
        device.config = _deviceClass.config;
    }

    Iterable get config => device.config.keys;

    DeviceCreateComponent(this.restService);

    save() => restService.createDevice(device);

    bool visible(DeviceClass deviceClass) =>
        !deviceClass.getValue('visibility', []).any((rule) => ['read', 'hidden'].contains(rule));
}
