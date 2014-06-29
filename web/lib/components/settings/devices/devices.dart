part of raxa_web;

@Component(
    selector: 'devices-settings',
    templateUrl: 'lib/components/settings/devices/devices.html',
    publishAs: 'cmp',
    useShadowDom: false
)
class DevicesSettingsComponent {
    final RestService restService;

    List<Device> devices = [];

    DevicesSettingsComponent(this.restService) {
        restService.getDevices().then((devices) => this.devices = devices);
    }
}
