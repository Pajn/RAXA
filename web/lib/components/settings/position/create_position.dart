part of raxa_web;

@Component(
    selector: 'position-create',
    templateUrl: 'lib/components/settings/position/create_position.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {'position': '<=>position'}
)
class PositionCreateComponent {
    final RestService restService;

    Position position;

    PositionCreateComponent(this.restService);

    save() => restService.createPosition(position)
        .then((_) => position = new Position()..parent = position.parent);
}
