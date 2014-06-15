part of raxa.device;

class DeviceManager {
    static const COLLECTION = 'Devices';

    Database db;

    DeviceManager(this.db);

    Future create(Device device) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'name': device.name}).then((dbObject) {

                if (dbObject != null) {
                    throw 'Name already exist';
                }

                return collection.insert(device);
            });
        }).whenComplete(db.close);

    /**
     * Deletes a [Device] from the database.
     */
    Future delete(String id) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.remove({'_id': new ObjectId.fromHexString(id)});
        }).whenComplete(db.close);

    /**
     * Reads a [Device] from the database.
     */
    Future<Device> read(String id) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'_id': new ObjectId.fromHexString(id)}).then((dbObject) {

                if (dbObject == null) {
                    return null;
                }

                return new Device.from(dbObject);
            });
        }).whenComplete(db.close);

    /**
     * Reads all [Device]s from the database.
     */
    Future<List<Device>> readAll([Map query = const {}]) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            var devices = [];

            return collection.find(query).forEach((dbObject) {
                devices.add(new Device.from(dbObject));
            }).then((_) => devices);
        }).whenComplete(db.close);

    /**
     * Updates plugin settings in the database.
     */
    Future update(Map device, String id) =>
        db.open().then((_) {
            var collection = db.collection(COLLECTION);

            return collection.update({'_id': new ObjectId.fromHexString(id)}, {r'$set': device});
        }).whenComplete(db.close);
}
