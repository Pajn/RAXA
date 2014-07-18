part of raxa_web;

@Component(
    selector: 'positions-settings',
    templateUrl: 'lib/components/settings/positions/positions.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {'parent': '=>parent'}
)
class PositionsSettingsComponent extends AttachAware {
    final ModelService modelService;
    final RestService restService;

    bool attached = false;

    Position _parent;
    Position newPosition = new Position();
    List<Position> get positions => (attached) ? modelService.positions : [];

    String get parentId => (_parent == null) ? null : _parent.id;

    set parent(Position value) {
        _parent = value;
        newPosition.parent = parentId;
    }

    PositionsSettingsComponent(this.modelService, this.restService);

    attach() => attached = true;

    bool isChild(Position position) => position.parent == parentId;
}
