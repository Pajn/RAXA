part of raxa_web;

@Component(
    selector: 'config',
    templateUrl: 'lib/components/config/config.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {
        'config': '=>config',
        'device': '=>device'
    }
)
class ConfigComponent {
    RestService restService;

    Map config;
    Device device;

    var _options;

    bool get readOnly => config['visibility'] == 'read';

    bool get useInput => !useSelect && !readOnly;
    bool get useSelect => config.containsKey('enum') || config['type'] == 'deviceId';

    String get inputType =>
        (config['type'] == 'number' || config['type'] == 'integer') ? 'number' :
        'text';

    List<Map> get options {
        if (_options == null) {
            _options = [];

            if (config['type'] == 'deviceId') {

                restService.getDevices({
                    'implementedInterfaces': config['interface']
                }).then((devices) {
                    _options.addAll(devices.map((device) => {
                        'value': device.id, 'label': device.name
                    }));
                });

            } else {
                _options.addAll(config['enum'].map((value) => {
                    'value': value, 'label': value
                }));
            }
        }

        return _options;
    }

    ConfigComponent(this.restService, Scope scope) {
        scope.watch("cmp.config['value']", (value, _) => print(value));
    }
}
