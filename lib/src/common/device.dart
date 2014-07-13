part of raxa.common;

class Device extends ModelBase {
    /// A unique, auto generated id of the device.
    String get id => this['_id'];
    /// A unique name of the device. The name may change and thus can't be used as identification.
    String get name => this['name'];
    set name(String value) => this['name'] = value;

    String get plugin => this['plugin'];
    set plugin(String value) => this['plugin'] = value;

    String get deviceClass => this['deviceClass'];
    set deviceClass(String value) => this['deviceClass'] = value;

    /// Configuration values for the plugin. May be a network id or similar.
    Map<String, dynamic> get config => getValue('config', {});
    set config(Map<String, dynamic> value) => this['config'] = value;

    /// A list of the [Interface]s (names) that the [Device] created from this class implements.
    List<String> get implementedInterfaces => getValue('implementedInterfaces', []);
    set implementedInterfaces(List<String> value) =>
        this['implementedInterfaces'] = value;

    /// The status of the device as required by the implemented interfaces. Every implemented
    /// interface with status have its own map with its status values.
    Map<String, Map<String, dynamic>> get status => getValue('status', {});

    /// The variables of the device as required by the implemented interfaces. Every implemented
    /// interface with status have its own map with its variables.
    Map<String, dynamic> get variables => getValue('variables', {});
    set variables(Map<String, dynamic> value) => this['variables'] = value;

    Device();
    Device.from(Map<String, dynamic> other, {removeId: false}) : super.from(other, removeId: removeId) {
        if (this['_id'].runtimeType.toString() == 'ObjectId') {
            this['_id'] = this['_id'].toHexString();
        }
    }
}