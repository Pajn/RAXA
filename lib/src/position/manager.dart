part of raxa.position;

class PositionManager {
    static const COLLECTION = 'Positions';

    Database db;
    EventBus eventBus;

    PositionManager(this.db, this.eventBus);

    Future create(Position position) => validateModel(position)
        .then((valid) {
            if (!valid) {
                throw 'Position is not valid';
            }
        })
        .then((_) => db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'name': position.name}).then((dbObject) {
                if (dbObject != null) {
                    throw 'Name already exist';
                }
            })
            .then((_) {
                position['_id'] = new ObjectId();

                collection.insert(position);

                position['_id'] = position['_id'].toHexString();

                eventBus.add(new EventMessage('Position', 'created', position));
            });
        }));

    /**
     * Deletes a [Position] from the database.
     */
    Future delete(String id) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            collection.remove({'_id': new ObjectId.fromHexString(id)});

            eventBus.add(new EventMessage('Position', 'deleted', id));
        });

    /**
     * Reads a [Position] from the database.
     */
    Future<Device> read(String id) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            return collection.findOne({'_id': new ObjectId.fromHexString(id)}).then((dbObject) {
                if (dbObject == null) {
                    return null;
                }

                return new Position.from(dbObject);
            });
        });

    /**
     * Reads all [Position]s from the database.
     */
    Future<List<Position>> readAll([Map query = const {}]) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            var positions = [];

            return collection.find(query).forEach((dbObject) {
                positions.add(new Position.from(dbObject));
            }).then((_) => positions);
        });

    /**
     * Updates a [Position] in the database.
     */
    Future update(Map position, String id) =>
        db.connect((db) {
            var collection = db.collection(COLLECTION);

            collection.update({'_id': new ObjectId.fromHexString(id)}, {r'$set': position});

            eventBus.add(new EventMessage('Position', 'updated', {
                'id': id,
                'changed': position,
            }));
        });
}
