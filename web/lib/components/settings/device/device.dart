part of raxa_web;

@Component(
    selector: 'device-settings',
    templateUrl: 'lib/components/settings/device/device.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {'device': '=>device'}
)
class DeviceSettingsComponent {
    final RestService restService;

    Device device;
    bool show = false;

    Iterable get config => device.config.keys;

    DeviceSettingsComponent(this.restService);

    save() => restService.saveDevice(device);
}
