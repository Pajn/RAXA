part of raxa.common;

/**
 * A [Call] to a [Interface] method.
 */
class Call extends ModelBase {
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
