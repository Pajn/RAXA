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
                'devices': ngRoute(
                    path: '/devices',
                    viewHtml: '<devices-settings></devices-settings>')
            })
    });
}

class WebModule extends Module {
    WebModule() {
        bind(ConfigComponent);
        bind(DevicesWidget);
        bind(InterfaceDimLevelComponent);
        bind(InterfaceLampComponent);
        bind(InterfaceSyncComponent);
        bind(DeviceCreateComponent);
        bind(DeviceSettingsComponent);
        bind(DevicesSettingsComponent);
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
          .run()
          .get(WebSocketService);
}
