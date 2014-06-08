part of raxa.configuration;

/**
 * Handles configuration values stored in config file.
 *
 * This class is a singleton, it will load the configuration
 * on creation and will then keep it for the whole lifetime.
 */
class Config {
    static const CONFIG_FILE = 'configuration.yaml';
    static var _instance;

    var _configValues = {};

    factory Config() {
        if (_instance == null) {
            _instance = new Config._load();
        }

        return _instance;
    }

    /**
     * Loads the configuration from the file
     */
    Config._load() {
        var configFile = _readConfigFile();
        var configuration = {};

        if (configFile != null) {
            configuration = loadYaml(configFile);
        }

        if (configuration.containsKey('database')) {
            var database = configuration['database'];

            if (database is String) {
                _configValues['database'] = database;
            } else if (database is YamlMap) {
                _createDbString(database['name'],
                                database['host'],
                                database['user'],
                                database['password'],
                                database['password']);
            } else {
                _createDbString();
            }
        } else {
            _createDbString();
        }
    }

    /**
     * Read the config file.
     *
     * Returns the content as a [String] on success or null otherwise.
     */
    _readConfigFile() {
        try {
            var configFile = new File(CONFIG_FILE);
            return configFile.readAsStringSync();
        } catch(_) {
            return null;
        }
    }

    /**
     * Generates a mongodb connection string.
     *
     * Default values is a dbname of RAXA, host as localhost on default port and no authentication.
     */
    _createDbString([name, host, user, password, port]) {
        name = name != null ? name : 'RAXA';
        host = host != null ? host : 'localhost';
        user = user != null ? user : '';

        if (user == null && password != null) {
            throw new ArgumentError('A database user must be specified if a password is set');
        }

        var connectionString = new StringBuffer('mongodb://$user');
        if (password != null) {
            connectionString.write(':$password');
        }
        if (user != null) {
            connectionString.write('@');
        }
        connectionString.write(host);
        if (port != null) {
            connectionString.write(':$port');
        }
        connectionString.write('/$name');

        _configValues['database'] = connectionString.toString();
    }

    String get dbString => _configValues['database'];
}
