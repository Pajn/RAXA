part of raxa.configuration;

typedef DatabaseFunction(Db db);

class Database {
    Config config;

    Database(this.config);

    Future connect(DatabaseFunction fn) {
        Db db = new Db(config.dbString);

        return db.open().then((_) => fn(db)).whenComplete(db.close);
    }
}
