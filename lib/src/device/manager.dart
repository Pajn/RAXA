part of raxa.device;

class DeviceManager {
    static const COLLECTION = 'Devices';

    Database db;
    DeviceClassManager classManager;

    DeviceManager(this.db, this.classManager);

    Future create(Device device) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'name': device.name}).then((dbObject) {
                if (dbObject != null) {
                    throw 'Name already exist';
                }
            })
            .then((_) => classManager.read(device.plugin, device.deviceClass))
            .then((deviceClass) {
                if (deviceClass == null) {
                    throw 'Specified DeviceClass does not exist';
                }
                deviceClass.validate(device);

                return collection.insert(device);
            });
        });

    /**
     * Deletes a [Device] from the database.
     */
    Future delete(String id) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.remove({'_id': new ObjectId.fromHexString(id)});
        });

    /**
     * Reads a [Device] from the database.
     */
    Future<Device> read(String id) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'_id': new ObjectId.fromHexString(id)})
                .then((dbObject) {

                    if (dbObject == null) {
                        return null;
                    }

                    return new Device.from(dbObject);
                });
        });

    /**
     * Reads all [Device]s from the database.
     */
    Future<List<Device>> readAll([Map query = const {}]) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            var devices = [];

            return collection.find(query).forEach((dbObject) {
                devices.add(new Device.from(dbObject));
            }).then((_) => devices);
        });

    /**
     * Updates a [Device] in the database.
     */
    Future update(Map device, String id) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.update({'_id': new ObjectId.fromHexString(id)}, {r'$set': device});
        });
}