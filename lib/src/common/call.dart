part of raxa.common;

/**
 * A [Call] to a [Interface] method.
 */
class Call extends ModelBase {
    /// The schema to validate against as specified in v4 draft at <http://json-schema.org/>
    final Map jsonSchema = const {
        r'$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'properties': const {
            'deviceId': const {'type': 'string'},
            'interface': const {'type': 'string'},
            'method': const {'type': 'string'},
            'arguments': const {'type': 'object'},
        },
        'required': const ['deviceId', 'interface', 'method'],
    };

    String get deviceId => this['deviceId'];
    set deviceId(String value) => this['deviceId'] = value;

    String get interface => this['interface'];
    set interface(String value) => this['interface'] = value;

    String get method => this['method'];
    set method(String value) => this['method'] = value;

    Map<String, dynamic> get arguments => getValue('arguments', {});
    set arguments(Map<String, dynamic> value) => this['arguments'] = value;

    Call();
    Call.from(Map<String, dynamic> other) : super.from(other);
}
