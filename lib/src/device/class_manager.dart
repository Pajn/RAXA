part of raxa.device;

class DeviceClassManager {
    static const COLLECTION = 'DeviceClasses';

    Database db;

    DeviceClassManager(this.db);

    /**
     * Installs a new [DeviceClass].
     */
    Future install(DeviceClass deviceClass) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({
                'name': deviceClass['name'],
                'plugin': deviceClass['plugin'],
            }).then((dbObject) {

                if (dbObject != null) {
                    throw 'DeviceClass already installed';
                }

                return collection.insert(deviceClass);
            });
        }).whenComplete(db.close);

    /**
     * Reads a [DeviceClass] from the database.
     *
     * [plugin]: The name of the plugin that implements the [DeviceClass] to read.
     * [name]: The name of the [DeviceClass] to read .
     *
     * Returns null if not found.
     */
    Future<DeviceClass> read(String plugin, String name) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({
                'name': name,
                'plugin': plugin
            }).then((dbObject) {

                if (dbObject == null) {
                    return null;
                }

                return new DeviceClass.from(dbObject);
            });
        }).whenComplete(db.close);

    /**
     * Reads all [DeviceClass]s from the database, or limited if [query] is specified.
     *
     * [query]: An optional mongodb query to limit the search ,
     */
    Future<List<DeviceClass>> readAll([Map query = const {}]) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            var deviceClasses = [];

            return collection.find(query).forEach((dbObject) {
                deviceClasses.add(new DeviceClass.from(dbObject));
            }).then((_) => deviceClasses);
        }).whenComplete(db.close);
}
