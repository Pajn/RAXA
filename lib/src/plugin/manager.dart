part of raxa.plugin;

class PluginManager {
    static const COLLECTION = 'Plugins';

    Database db;
    DeviceClassManager deviceClassManager;
    InterfaceManager interfaceManager;
    EventBus eventBus;

    Map<String, PluginInstance> enabledPlugins = {};

    PluginManager(this.db, this.deviceClassManager, this.interfaceManager, this.eventBus) {
        new Directory.fromUri(new Uri.file('plugins')).list().listen((file) {
            if (file is Directory) {
                var pluginName = new Uri.file(file.path).pathSegments.last;

                read(pluginName).then((plugin) {
                    if (plugin == null) {
                        install(pluginName).then((_) => enable(pluginName));
                    }
                });
            }
        });

        readAll({'enabled': true}).then((plugins) {
            plugins.forEach((plugin) {
                enable(plugin.name);
            });
        });
    }

    call(Call call, Device device) {
        var plugin = enabledPlugins[device.plugin];
        print(call);
        print(device);

        if (plugin is PluginInstance) {
            plugin.sendPort.send(new CallMessage(call, device));
        }
    }

    Future install(String pluginName) =>
        Plugin.fromManifest(pluginName).then((plugin) =>
            db.connect((db) {
                var collection = db.collection(COLLECTION);

                collection.insert(plugin);

                eventBus.add(new EventMessage('Plugin', 'installed', plugin));
            })
        );

    Future enable(String pluginName) {
        if (enabledPlugins.containsKey(pluginName)) {
            update({'enabled': true}, pluginName);

            throw 'Plugin already enabled';
        }

        return read(pluginName).then((plugin) {
            if (plugin == null) {

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
                .then((_) => enabledPlugins[plugin.name] = new PluginInstance(plugin.name))
                .then((_) => eventBus.add(new EventMessage('Plugin', 'enabled', plugin)));
        });
    }

    Future disable(String pluginName) {
        // TODO disable plugin
    }

    /**
     * Reads all information of a plugin from the database.
     */
    Future<Plugin> read(String plugin) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'name': plugin}).then((dbObject) {

                if (dbObject == null) {
                    return null;
                }

                return new Plugin.from(dbObject);
            });
        });

    /**
     * Reads all available plugins from the database.
     */
    Future<List<Plugin>> readAll([Map query = const {}]) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            var plugins = [];

            return collection.find(query).forEach((dbObject) {
                plugins.add(new Plugin.from(dbObject));
            }).then((_) => plugins);
        });

    /**
     * Updates plugin settings in the database.
     */
    Future update(Map settings, String pluginName) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            collection.update({'name': pluginName}, {r'$set': settings});

            eventBus.add(new EventMessage('Plugin', 'updated', {
                'name': pluginName,
                'changed': settings,
            }));
        });
}
