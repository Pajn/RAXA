part of raxa.plugin;

class Plugin extends ModelBase {
    String get name => this['name'];
    String get version => this['version'];
    List<String> get api => this['api'];

    bool get enabled => getValue(this['enabled'], false);
    set enabled(bool value) => this['enabled'] = value;

    String get descriptionSummary => this['descriptionSummary'];
    String get description => this['description'];

    List<String> get providedInterfaces => getValue('providedInterfaces', []);
    List<String> get requiredInterfaces => getValue('requiredInterfaces', []);

    Plugin.from(Map<String, dynamic> other) : super.from(other);

    static Future<Plugin> fromManifest(String name) =>
        new File('plugins/$name/plugin.yaml')
            .readAsString()
            .then((file) => new Plugin.from(loadYaml(file)));
}
