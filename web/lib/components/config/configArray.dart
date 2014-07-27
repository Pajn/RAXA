part of raxa_web;

@Component(
    selector: 'config-array',
    templateUrl: 'lib/components/config/configArray.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {
        'config': '=>config'
    }
)
class ConfigArrayComponent {
    Map _newConfig;
    Map _config;

    Map get newConfig {
        if (_newConfig == null) {
            _newConfig = new Map.from(config['items']);
        }

        return _newConfig;
    }

    Map get config => _config;
    set config(Map config) {
        _config = config;

        if (config['value'] == null) {
            config['value'] = [];
        }
    }

    ConfigArrayComponent();

    add() {
        config['value'].add(newConfig);
        _newConfig = null;
    }
}
