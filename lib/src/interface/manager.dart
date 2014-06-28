part of raxa.interface;

class InterfaceManager {
    static const COLLECTION = 'Interfaces';

    Database db;

    InterfaceManager(this.db);

    Future install(Interface interface) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'name': interface.name}).then((dbObject) {

                if (dbObject != null) {
                    throw 'Interface already installed';
                }

                return collection.insert(interface);
            });
        });

    /**
     * Reads an [Interface] from the database.
     */
    Future<Interface> read(String interface) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'name': interface}).then((dbObject) {

                if (dbObject == null) {
                    return null;
                }

                return new Interface.from(dbObject);
            });
        });

    /**
     * Reads all [Interface]s from the database.
     */
    Future<List<Interface>> readAll() =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            var interfaces = [];

            return collection.find().forEach((dbObject) {
                interfaces.add(new Interface.from(dbObject));
            }).then((_) => interfaces);
        });

    /**
     * Validates a [Call] accordance to it's [Interface].
     *
     * Throws on error.
     */
    Future validateCall(Call call, Device device) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'name': call.interface}).then((dbObject) {

                if (dbObject == null) {
                    throw 'Unsupported interface "${call.interface}"';
                }

                new Interface.from(dbObject, device).validate(call);
            });
        });
}
