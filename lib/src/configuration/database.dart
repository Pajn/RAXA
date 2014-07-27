part of raxa.configuration;

class Database {
    Config config;

    Database(this.config);

    Future<Db> connect(Function fn) {
        var db = new Db(config.dbString);

        return db.open().then((_) => fn(db)).whenComplete(db.close);
    }
}
