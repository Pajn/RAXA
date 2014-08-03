import 'package:angular/angular.dart';
import 'package:angular/application_factory.dart';
import 'package:logging/logging.dart';

import 'lib/raxa.dart';

void routeInitializer(Router router, RouteViewFactory views) {
    views.configure({
        'main': ngRoute(
            path: '/',
            view: 'views/main.html'),
        'settings': ngRoute(
            path: '/settings',
            view: 'views/settings.html',
            mount: {
                'actions': ngRoute(
                    path: '/actions',
                    viewHtml: '<actions-settings></actions-settings>'),
                'devices': ngRoute(
                    path: '/devices',
                    viewHtml: '<devices-settings></devices-settings>'),
                'positions': ngRoute(
                    path: '/positions',
                    viewHtml: '<positions-settings></positions-settings>'),
                'scenarios': ngRoute(
                    path: '/scenarios',
                    viewHtml: '<scenarios-settings></scenarios-settings>'),
            })
    });
}

class WebModule extends Module {
    WebModule() {
        bind(ConfigComponent);
        bind(ConfigArrayComponent);
        bind(ConfigCallComponent);
        bind(ConfigEventComponent);
        bind(DevicesWidget);
        bind(InterfaceDimLevelComponent);
        bind(InterfaceLampComponent);
        bind(InterfaceSyncComponent);
        bind(ActionsSettingsComponent);
        bind(DeviceCreateComponent);
        bind(DeviceSettingsComponent);
        bind(DevicesSettingsComponent);
        bind(PositionSettingsComponent);
        bind(PositionCreateComponent);
        bind(PositionsSettingsComponent);
        bind(ScenariosSettingsComponent);
        bind(ModelService);
        bind(RestService);
        bind(WebSocketService);
        bind(RouteInitializerFn, toValue: routeInitializer);
    }
}

main() {
    Logger.root.level = Level.ALL;
    Logger.root.onRecord.listen((LogRecord r) {
        print(r.message);
    });
    applicationFactory()
          .addModule(new WebModule())
          .run();
}
