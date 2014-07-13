part of raxa.configuration;

/**
 * Handles settings stored in the database.
 */
class Settings {
    static const COLLECTION = 'Settings';

    Database db;
    EventApi eventApi;

    Settings(this.db, this.eventApi);

    /**
     * Loads settings from the database, saves and returns [defaultSettings]
     * if none exists.
     *
     * Specify [group] to use other settings group than core.
     */
    Future<Map> load(Map defaultSettings, [String group = 'core']) =>
        db.connect((db) {
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
        });

    /**
     * Reads settings from the database.
     *
     * Specify [group] to use other settings group than core.
     */
    Future<Map> read([String group = 'core']) =>
        db.connect((db) {
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
        });

    /**
     * Reads all settings from the database.
     */
    Future<Map<String, Map>> readAll() =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            var settings = {};

            return collection.find().forEach((dbObject) {
                settings[dbObject['group']] = {
                    'version': dbObject['version'],
                    'settings': dbObject['settings'],
                };
            }).then((_) => settings);
        });

    /**
     * Saves settings to the database.
     *
     * Specify [group] to use other settings group than core.
     */
    Future save(Map settings, [String group = 'core']) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            collection.update({'group': group}, {r'$set': settings});

            eventApi.broadcast(new EventMessage('Settings', 'updated', {
                'group': group,
            }));
        });
}
