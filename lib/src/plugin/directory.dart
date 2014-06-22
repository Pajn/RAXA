part of raxa.plugin;

class PluginDirectory {
    static const REQUIRED_FILES = const ['main.dart', 'plugin.yaml'];
    Directory directory;
    Plugin plugin;

    PluginDirectory(this.plugin) {
        directory = new Directory.fromUri(new Uri.file('plugins/${plugin.name}'));
    }

    Future isValid() =>
        directory.exists().then((exists) {
            if (!exists) {
                throw 'Plugin directory does not exist';
            }

            return Future.wait(
                REQUIRED_FILES.map((file) => FileSystemEntity.isFile('plugins/${plugin.name}/$file')),
                eagerError: true
            );
        }).then((filesExist) {
            if (filesExist.any((exist) => !exist)) {
                throw 'Missing required file "${REQUIRED_FILES[filesExist.indexOf(false)]}"';
            }
        });

    Future<List<DeviceClass>> getDeviceClasses() =>
        Future.wait(
            plugin.deviceClasses.map((deviceClass) =>
                new File('plugins/${plugin.name}/deviceClasses/$deviceClass.yaml')
                    .readAsString()
                    .then((file) => new DeviceClass.from(loadYaml(file)))),
            eagerError: true
        );

    Future<List<Interface>> getProvidedInterfaces() =>
        Future.wait(
            plugin.providedInterfaces.map((interface) =>
                new File('plugins/${plugin.name}/interfaces/$interface.yaml')
                    .readAsString()
                    .then((file) => new Interface.from(loadYaml(file)))),
            eagerError: true
        );
}
