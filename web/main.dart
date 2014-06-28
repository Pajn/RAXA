import 'package:angular/angular.dart';
import 'package:angular/application_factory.dart';
import 'package:logging/logging.dart';

import 'lib/raxa.dart';

void routeInitializer(Router router, RouteViewFactory views) {
    views.configure({
        'main': ngRoute(
            path: '/',
            view: 'views/main.html')
    });
}

class WebModule extends Module {
    WebModule() {
        bind(DevicesWidget);
        bind(InterfaceDimLevelComponent);
        bind(InterfaceLampComponent);
        bind(RestService);
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
