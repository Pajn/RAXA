part of raxa_web;

@Component(
    selector: 'config-call',
    templateUrl: 'lib/components/config/configCall.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {
        'config': '=>config'
    }
)
class ConfigCallComponent {
    ModelService modelService;

    Device _device;
    Map _method;
    List<Map> arguments;
    Map config;
    List<Map> methods;

    Call get call {
        if (config['value'] == null) {
            config['value'] = new Call();
        }

        return config['value'];
    }

    Device get device {
        if (_device == null && call.deviceId != null) {
            _device = modelService.devices.singleWhere((device) =>
                device.id == call.deviceId);
        }

        return _device;
    }

    set device(Device device) {
        _device = device;
        call.deviceId = device.id;

        populateMethods();
    }

    Map get method {
        if (methods == null) {
            populateMethods();
        }

        if (_method == null && call.interface != null && call.method != null) {
            _method = methods.singleWhere((method) =>
                method['interface'] == call.interface &&
                method['method'] == call.method);
        }

        return _method;
    }

    set method(Map method) {
        _method = method;
        call.interface = method['interface'];
        call.method = method['method'];
        arguments = method['arguments']['arguments'].values.toList();
    }

    List<Device> get devices => modelService.devices;

    ConfigCallComponent(this.modelService);

    populateMethods() {
        methods = [];
        modelService.interfaces
        .where((interface) =>
            device.implementedInterfaces.contains(interface.name)
        ).forEach((interface) {
            interface.methods.forEach((method, arguments) =>
                methods.add({
                    'label' : '${interface.name}: ${method}',
                    'interface': interface.name,
                    'method': method,
                    'arguments': arguments,
                }));
        });
    }
}
