part of raxa_web;

@Component(
    selector: 'device-create',
    templateUrl: 'lib/components/settings/device/create_device.html',
    publishAs: 'cmp',
    useShadowDom: false
)
class DeviceCreateComponent {
    final RestService restService;

    Device device = new Device();
    List<DeviceClass> deviceClasses = [];

    DeviceClass _deviceClass;

    get deviceClass => _deviceClass;
    set deviceClass(value) {
        _deviceClass = value;
        _deviceClass.validate(device);
        device.deviceClass = deviceClass.name;
        device.plugin = deviceClass.plugin;
        device.config = _deviceClass.config;
    }

    Iterable get config => device.config.keys;

    DeviceCreateComponent(this.restService, Scope scope) {
        restService.getDeviceClasses().then((deviceClasses) => this.deviceClasses = deviceClasses);
    }

    save() => restService.createDevice(device);
}
