part of raxa_web;

@Component(
    selector: 'config-event',
    templateUrl: 'lib/components/config/configEvent.html',
    publishAs: 'cmp',
    useShadowDom: false,
    map: const {
        'config': '=>config'
    }
)
class ConfigEventComponent {
    Map config;

    bool scanning = false;

    ConfigEventComponent(WebSocketService webSocketService) {
        webSocketService.onPluginEvent
            .where((_) => scanning)
            .where((event) => (config['interface'] != null) ?
                              event.interface == config['interface'] : true)
            .where((event) => (config['event'] != null) ?
                              event.event == config['event'] : true)
            .listen((event) {
                scanning = false;
                config['value'] = event;
            });
    }

    scan() {
        scanning = true;
    }
}
