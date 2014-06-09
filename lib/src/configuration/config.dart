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
                                database['hostname'],
                                database['user'],
                                database['password'],
                                database['port']);
            } else {
                _createDbString();
            }
        } else {
            _createDbString();
        }

        _configValues['rest'] = {};
        _configValues['rest']['hostname'] = '127.0.0.1';
        _configValues['rest']['port'] = 80;

        if (configuration.containsKey('rest')) {
            var rest = configuration['rest'];

            if (rest.containsKey('hostname')) {
                _configValues['rest']['hostname'] = rest['hostname'];
            }

            if (rest.containsKey('port')) {
                _configValues['rest']['port'] = rest['port'];
            }
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
     * Default values is a dbname of RAXA, hostname as localhost on default port and no authentication.
     */
    _createDbString([name, hostname, user, password, port]) {
        name = name != null ? name : 'RAXA';
        hostname = hostname != null ? hostname : 'localhost';
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
        connectionString.write(hostname);
        if (port != null) {
            connectionString.write(':$port');
        }
        connectionString.write('/$name');

        _configValues['database'] = connectionString.toString();
    }

    String get dbString => _configValues['database'];

    String get restHostname => _configValues['rest']['hostname'];
    int get restPort => _configValues['rest']['port'];
}
