part of raxa.configuration;

/**
 * A wrapper for mongo_darts [Db]
 */
class Database extends Db {
    Database(Config config) : super(config.dbString);
}
