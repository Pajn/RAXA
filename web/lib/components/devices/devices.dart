part of raxa_web;

@Component(
    selector: 'devices',
    templateUrl: 'lib/components/devices/devices.html',
    publishAs: 'cmp',
    useShadowDom: false
)
class DevicesWidget {
    static const SUPPORTED = const ['Lamp', 'DimLevel'];
    final RestService restService;

    List<Device> devices = [];

    DevicesWidget(this.restService) {
        restService.getDevices().then((devices) => this.devices = devices);
    }

    bool supported(Device device) =>
        device.implementedInterfaces.any((interface) => SUPPORTED.contains(interface));
}
