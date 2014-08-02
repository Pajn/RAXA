part of raxa.plugin;

class Plugin extends ModelBase {
    /// The schema to validate against as specified in v4 draft at <http://json-schema.org/>
    final Map jsonSchema = const {
        r'$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'properties': const {
            'name': const {
                'type': 'string',
                'pattern': r'^[A-Z]+([a-zA-Z0-9])*$', // Must start with uppercase English letter
                                                      // and must only contain English letters or
                                                      // numbers.
            },
            'version': const {'type': 'string'},
            'api': const {'type': 'string'},
            'descriptionSummary': const {'type': 'string'},
            'description': const {'type': 'string'},
            'providedInterfaces': const {
                'type': 'array',
                'items': const {'type': 'string'},
                'uniqueItems': true,
            },
            'requiredInterfaces': const {
                'type': 'array',
                'items': const {'type': 'string'},
                'uniqueItems': true,
            },
            'deviceClasses': const {
                'type': 'array',
                'items': const {
                    'type': 'string',
                    'pattern': r'^[A-Z]+([a-zA-Z0-9])*$', // Must start with uppercase English letter
                                                          // and must only contain English letters or
                                                          // numbers.
                },
                'uniqueItems': true,
            },
        },
        'required': const ['name', 'version', 'api'],
    };

    String get name => this['name'];
    String get version => this['version'];
    String get api => this['api'];

    bool get enabled => getValue(this['enabled'], false);
    set enabled(bool value) => this['enabled'] = value;

    String get descriptionSummary => this['descriptionSummary'];
    String get description => this['description'];

    List<String> get providedInterfaces => getValue('providedInterfaces', []);
    List<String> get requiredInterfaces => getValue('requiredInterfaces', []);

    List<String> get deviceClasses => getValue('deviceClasses', []);

    Plugin.from(Map<String, dynamic> other) : super.from(other);

    static Future<Plugin> fromManifest(String pluginFolderPath, String name) {
        print('Plugin.fromManifest, $pluginFolderPath, $name');
        return new File('$pluginFolderPath/$name/plugin.yaml')
            .readAsString()
            .then((file) => new Plugin.from(loadYaml(file)));
    }
}
