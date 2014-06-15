part of raxa.interface;

/**
 * [Interface]s describe how to communicate with [Device]s
 */
class Interface extends ModelBase {
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
    validate(Call call) {
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
