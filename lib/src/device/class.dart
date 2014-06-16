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
    /// The variables of the device as required by the implemented interfaces. Every implemented
    /// interface with status have its own map with its variables.
    Map<String, dynamic> get variables => getValue('variables', {});

    DeviceClass.from(Map<String, dynamic> other) : super.from(other);

    /**
     * Validate that the [device] matches this [DeviceClass].
     *
     * Will overwrite fields that should be copied and throws if the [device]
     * have any errors.
     */
    validate(Device device) {
        device.implementedInterfaces = implementedInterfaces;
        device.variables = variables;

        // TODO Validate config
    }
}
