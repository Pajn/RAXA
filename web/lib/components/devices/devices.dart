part of raxa_web;

@Component(
    selector: 'devices',
    templateUrl: 'lib/components/devices/devices.html',
    publishAs: 'cmp',
    useShadowDom: false
)
class DevicesWidget {
    static const SUPPORTED = const ['Lamp', 'DimLevel'];
    final ModelService modelService;
    final RestService restService;

    DevicesWidget(this.modelService, this.restService);

    bool supported(Device device) =>
        device.implementedInterfaces.any((interface) => SUPPORTED.contains(interface));
}
