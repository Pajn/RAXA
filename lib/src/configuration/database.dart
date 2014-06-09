part of raxa.configuration;

/**
 * A wrapper for mongo_darts [Db] that connects to the database
 * as specified in the [Config].
 */
class Database extends Db {
    Database(Config config) : super(config.dbString);
}
