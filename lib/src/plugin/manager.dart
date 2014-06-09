part of raxa.plugin;

class PluginManager {
    static const COLLECTION = 'Plugins';

    Database db;

    PluginManager(this.db);

    /**
     * Reads all information of a plugin from the database.
     */
    Future<Map> read(String plugin) =>
    db.open().then((_) {
        var collection = db.collection(COLLECTION);

        return collection.findOne({'name': plugin}).then((dbObject) {

            if (dbObject == null) {
                return null;
            }

            return dbObject;
        });
    }).whenComplete(db.close);

    /**
     * Reads all available plugins from the database.
     */
    Future<List<Map>> readAll() =>
    db.open().then((_) {
        var collection = db.collection(COLLECTION);

        var plugins = [];

        return collection.find().forEach((plugin) {
            plugins.add({
                'name': plugin['name'],
                'version': plugin['version'],
                'apiVersion': plugin['apiVersion'],
                'enabled': plugin['enabled'],
                'descriptionSummary': plugin['descriptionSummary'],
            });
        }).then((_) => plugins);
    }).whenComplete(db.close);
}
