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
    int _value;

    bool show = false;

    int get value => (_value == null) ? device.status['level']['value']: _value;
    set value(int value) {
        _value = value;
        print(value);
        restService.call(new Call()
            ..deviceId = device.id
            ..interface = 'DimLevel'
            ..method = 'level'
            ..arguments = {
                'level': value
            }
        ).then((_) => _value = null);
    }

    InterfaceDimLevelComponent(this.restService);
}
