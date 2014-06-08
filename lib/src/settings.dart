part of raxa;

/**
 * Handles settings stored in the database.
 */
class Settings {
    static const COLLECTION = 'Settings';

    Db db;

    Settings(this.db);

    /**
     * Loads settings from the database, saves and returns [defaultSettings]
     * if none exists. Specify [group] to use other settings group than core.
     */
    Future<Map> load(Map defaultSettings, [String group = 'core']) =>
        db.open().then((s) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'group': group}).then((dbObject) {

                if (dbObject != null) {
                    return dbObject;
                } else {
                    return collection.insert({
                        'group': group,
                        'version': defaultSettings['version'],
                        'settings': defaultSettings['settings']
                    }).then((_) => defaultSettings);
                }
            });
        }).catchError((e) => print(e)).whenComplete(db.close);

    /**
     * Saves settings from the database. Specify [group] to use other
     * settings group than core.
     */
    Future save(Map settings, [String group = 'core']) =>
        db.open().then((s) {
            var collection = db.collection(COLLECTION);

            return collection.update({'group': group}, {r'$set': settings});
        }).whenComplete(db.close);
}
