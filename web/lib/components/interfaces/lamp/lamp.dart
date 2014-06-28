part of raxa_web;

@Component(
    selector: 'interface[name=lamp]',
    templateUrl: 'lib/components/interfaces/lamp/lamp.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {'device': '=>device'}
)
class InterfaceLampComponent {
    final RestService restService;

    Device device;

    InterfaceLampComponent(this.restService);

    call(String method) {
        restService.call(new Call()
            ..deviceId = device.id
            ..interface = 'Lamp'
            ..method = method
        );
    }
}
