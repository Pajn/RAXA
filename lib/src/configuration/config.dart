part of raxa.configuration;

/**
 * Handles configuration values stored in config file.
 */
class Config {
    var configPath;

    var _configValues = {};

    Config(ArgResults arguments) {
        if (arguments['config-file'] != null) {
            configPath = arguments['config-file'];
        } else {
            configPath = 'configuration.yaml';
        }
        _load();
    }

    /**
     * Loads the configuration from the file
     */
    _load() {
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
            var configFile = new File(configPath);
            return configFile.readAsStringSync();
        } catch(_) {
            return null;
        }
    }

    /**
     * Generates a mongodb connection string.
     *
     * Default values is a a database name of RAXA, hostname as localhost on default port
     * and no authentication.
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
