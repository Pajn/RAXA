part of raxa_web;

@Component(
    selector: 'position-settings',
    templateUrl: 'lib/components/settings/position/position.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {'position': '=>position'}
)
class PositionSettingsComponent {
    final RestService restService;

    Position position;

    PositionSettingsComponent(this.restService);

    delete() => restService.deletePosition(position);
    save() => restService.savePosition(position);
}
