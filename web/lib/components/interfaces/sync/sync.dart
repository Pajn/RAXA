part of raxa_web;

@Component(
    selector: 'interface[name=sync]',
    templateUrl: 'lib/components/interfaces/sync/sync.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {'device': '=>device'}
)
class InterfaceSyncComponent {
    final RestService restService;

    Device device;

    InterfaceSyncComponent(this.restService);

    sync() {
        restService.call(new Call()
            ..deviceId = device.id
            ..interface = 'Sync'
            ..method = 'sync'
        );
    }
}
