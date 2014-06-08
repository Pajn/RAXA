part of raxa.configuration;

/**
 * Handles settings stored in the database.
 */
class Settings {
    static const COLLECTION = 'Settings';

    Database db;

    Settings(this.db);

    /**
     * Loads settings from the database, saves and returns [defaultSettings]
     * if none exists.
     *
     * Specify [group] to use other settings group than core.
     */
    Future<Map> load(Map defaultSettings, [String group = 'core']) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'group': group}).then((dbObject) {

                if (dbObject != null) {
                    return dbObject;
                } else {
                    return collection.insert({
                        'group': group,
                        'version': defaultSettings['version'],
                        'settings': defaultSettings['settings'],
                    }).then((_) => defaultSettings);
                }
            });
        }).whenComplete(db.close);

    /**
     * Reads settings from the database.
     *
     * Specify [group] to use other settings group than core.
     */
    Future<Map> read([String group = 'core']) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'group': group}).then((dbObject) {

                if (dbObject == null) {
                    return null;
                }

                return {
                    'group': group,
                    'version': dbObject['version'],
                    'settings': dbObject['settings']
                };
            });
        }).whenComplete(db.close);

    /**
     * Reads all settings from the database.
     */
    Future<Map<String, Map>> readAll() =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            var settings = {};

            return collection.find().forEach((group) {
                settings[group['group']] = {
                    'version': group['version'],
                    'settings': group['settings'],
                };
            }).then((_) => settings);
        }).whenComplete(db.close);

    /**
     * Saves settings from the database.
     *
     * Specify [group] to use other settings group than core.
     */
    Future save(Map settings, [String group = 'core']) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.update({'group': group}, {r'$set': settings}, upsert: true);
        }).whenComplete(db.close);
}
