part of raxa.common;

/**
 * A [Call] to a [Interface] method.
 */
class Call extends ModelBase {
    String get deviceId => this['deviceId'];
    String get interface => this['interface'];
    String get method => this['method'];
    Map<String, dynamic> get arguments => getValue('arguments', {});

    Call.from(Map<String, dynamic> other) : super.from(other);
}
