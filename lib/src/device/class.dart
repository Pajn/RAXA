part of raxa.device;

/**
 * Every [Device] is created from a [DeviceClass] that describes
 * what the device implements and requires.
 *
 * [DeviceClass]es is provided by plugins while [Device]s is
 * created primarily by the user.
 */
class DeviceClass extends ModelBase {
    /// The name of this [DeviceClass], it must be unique inside the plugin.
    String get name => this['name'];
    /// The name of the plugin that specifies this [DeviceClass].
    String get plugin => this['plugin'];

    /// Configuration values for the plugin that is set by the user while creating the [Device].
    /// May be a network id or similar.
    Map<String, Map<String, dynamic>> get config => getValue('config', {});

    /// A list of the [Interface]s (names) that the [Device] created from this class implements.
    List<String> get implementedInterfaces => getValue('implementedInterfaces', []);

    /// A list of the [Interface]s (names) that the [Device] created from this class requires.
    List<String> get requiredInterfaces => getValue('requiredInterfaces', []);

    DeviceClass.from(Map<String, dynamic> other) : super.from(other);
}
