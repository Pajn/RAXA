part of raxa_web;

@Component(
    selector: 'interface[name=dimlevel]',
    templateUrl: 'lib/components/interfaces/dimLevel/dimLevel.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {'device': '=>device'}
)
class InterfaceDimLevelComponent {
    final RestService restService;

    Device device;

    bool show = false;
    int get value => 0;
    set value(int value) {
        print(value);
        restService.call(new Call()
            ..deviceId = device.id
            ..interface = 'DimLevel'
            ..method = 'level'
            ..arguments = {
                'level': value
            }
        );
    }

    InterfaceDimLevelComponent(this.restService);
}
