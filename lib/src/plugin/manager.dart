part of raxa.plugin;

class PluginManager {
    static const COLLECTION = 'Plugins';

    Database db;
    DeviceClassManager deviceClassManager;
    InterfaceManager interfaceManager;

    Map<String, PluginInstance> enabledPlugins = {};

    PluginManager(this.db, this.deviceClassManager, this.interfaceManager) {
        new Directory.fromUri(new Uri.file('plugins')).list().listen((file) {
            if (file is Directory) {
                var pluginName = new Uri.file(file.path).pathSegments.last;
                install(pluginName).then((_) => enable(pluginName));
            }
        });
    }

    Future install(String pluginName) =>
        Plugin.fromManifest(pluginName).then((plugin) =>
            db.open().then((_) {
                var collection = db.collection(COLLECTION);

                return collection.insert(plugin);
            }).whenComplete(db.close)
        );

    Future enable(String pluginName) {
        if (enabledPlugins.containsKey(pluginName)) {
            throw 'Plugin already enabled';
        }

        return read(pluginName).then((plugin) {
            if (plugin == null) {
                update({'enabled': true}, plugin.name);

                throw 'Plugin is not installed';
            }

            var pluginDirectory = new PluginDirectory(plugin);

            pluginDirectory.isValid()
                .then((_) => pluginDirectory.getProvidedInterfaces())
                .then((providedInterfaces) => Future.wait(providedInterfaces.map((interface) =>
                        interfaceManager
                            .install(interface)
                            .catchError((_) {}, test: (e) => e == 'Interface already installed')
                     )))
                .then((_) => pluginDirectory.getDeviceClasses())
                .then((deviceClasses) => Future.wait(deviceClasses.map((deviceClass) =>
                        deviceClassManager
                            .install(deviceClass)
                            .catchError((_) {}, test: (e) => e == 'DeviceClass already installed')
                     )))
                .then((_) => update({'enabled': true}, plugin.name))
                .then((_) => enabledPlugins['plugin'] = new PluginInstance(plugin.name));
        });
    }

    Future disable(String pluginName) {
        // TODO disable plugin
    }

    /**
     * Reads all information of a plugin from the database.
     */
    Future<Plugin> read(String plugin) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'name': plugin}).then((dbObject) {

                if (dbObject == null) {
                    return null;
                }

                return new Plugin.from(dbObject);
            });
        }).whenComplete(db.close);

    /**
     * Reads all available plugins from the database.
     */
    Future<List<Plugin>> readAll() =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            var plugins = [];

            return collection.find().forEach((dbObject) {
                plugins.add(new Plugin.from(dbObject));
            }).then((_) => plugins);
        }).whenComplete(db.close);

    /**
     * Updates plugin settings in the database.
     */
    Future update(Map settings, String pluginName) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.update({'name': pluginName}, {r'$set': settings});
        }).whenComplete(db.close);
}
