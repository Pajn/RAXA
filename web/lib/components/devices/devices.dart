part of raxa_web;

@Component(
    selector: 'devices',
    templateUrl: 'lib/components/devices/devices.html',
    publishAs: 'cmp',
    useShadowDom: false
)
class DevicesWidget {
    static const SUPPORTED = const ['Lamp', 'DimLevel'];
    final ModelService modelService;
    final RestService restService;
    final Scope scope;

    Position _position;
    List<Device> devices = [];
    List<Position> positions = [];

    Position get position => _position;
    set position(Position value) {
        _position = value;
        setDevices();
        setPositions();
    }

    String get positionId => (position == null) ? null : position.id;

    DevicesWidget(this.modelService, this.restService, this.scope) {
        scope.watch('cmp.modelService.devices', (_, __) => setDevices(), collection: true);
        scope.watch('cmp.modelService.positions', (_, __) => setPositions(), collection: true);
    }

    back() {
        try {
            position = modelService.positions
                .singleWhere((position) => position.id == this.position.parent);
        } on StateError catch(e) {
            position = null;
        }
    }

    setDevices() =>
        devices = modelService.devices.where((device) => device.position == positionId &&
            device.implementedInterfaces.any((interface) => SUPPORTED.contains(interface)))
                .toList();

    setPositions() =>
        positions = modelService.positions.where((position) => position.parent == positionId)
            .toList();
}
