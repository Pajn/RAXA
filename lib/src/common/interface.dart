part of raxa.common;

/**
 * [Interface]s describe how to communicate with [Device]s
 */
class Interface extends ModelBase {
    /// The schema to validate against as specified in v4 draft at <http://json-schema.org/>
    final Map jsonSchema = const {
        r'$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'properties': const {
            'name': const {
                'type': 'string',
                'pattern': r'^[A-Z]+([a-zA-Z0-9])*$', // Must start with uppercase English letter
                                                      // and must only contain English letters or
                                                      // numbers.
            },
            'methods': const {'type': 'object'},
            'status': const {'type': 'object'},
            'variables': const {'type': 'object'},
        },
        'required': const ['name'],
    };

    String get name => this['name'];
    Map<String, dynamic> get methods => getValue('methods', {});
    Map<String, dynamic> get status => getValue('status', {});
    Map<String, dynamic> get variables => getValue('variables', {});

    Interface.from(Map<String, dynamic> other, [Device device]) : super.from(other) {
        if (device != null) {
            this['variables'] = device.variables;
        }
    }

    _getOption(name, option) {
        if (option is String) {
            return variables[name];
        } else {
            return option;
        }
    }

    /**
     * Validates a [Call] accordance to the [Interface].
     *
     * Throws on error.
     */
    validateCall(Call call) {
        if (!methods.containsKey(call.method)) {
            throw 'Unsupported method "${call.method}"';
        }
        call.arguments.keys.forEach((argument) {
            if (!methods[call.method]['arguments'].containsKey(argument)) {
                throw 'Unexpected argument "$argument"';
            }
        });
        methods[call.method]['arguments'].forEach((argument, Map options) {
            if (options['optional'] != true && !call.arguments.containsKey(argument)) {
                throw 'Requiered argument "$argument" is missing';
            }
            if ((options['type'] == 'boolean' && call.arguments[argument] is! bool) ||
                (options['type'] == 'integer' && call.arguments[argument] is! int) ||
                (options['type'] == 'number' && call.arguments[argument] is! num) ||
                (options['type'] == 'string' && call.arguments[argument] is! String)) {
                throw 'Argument "$argument" expected type "${options['type']}"';
            }

            if (call.arguments.containsKey(argument)) {
                if (options['type'] == 'integer' || options['type'] == 'number') {
                    if (options['max'] != null) {
                        if (call.arguments[argument] > _getOption('max', options['max'])) {
                            throw 'Argument "$argument" is above maxmium value "${options['max']}"';
                        }
                    }
                    if (options['min'] != null) {
                        if (call.arguments[argument] < _getOption('min', options['min'])) {
                            throw 'Argument "$argument" is below minimum value "${options['min']}"';
                        }
                    }
                }
            }
        });
    }
}
