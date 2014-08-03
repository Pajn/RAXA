import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:raxa/plugin_helper.dart';

main(args, message) {
    var plugin = new Plugin(args, message)
        ..onPluginEvent.where((event) => event.interface == 'Trigger' && event.event == 'triggered')
            .listen((event) {
                var query = Uri.encodeQueryComponent(JSON.encode({
                    'deviceClass': 'Trigger',
                    'plugin': 'Triggers',
                    'config.trigger.value': event
                }));

                http.get('http://127.0.0.1:8080/rest/devices?query=$query')
                    .then((result) => JSON.decode(result.body))
                    .then((result) {
                        if (result['status'] == 'success' && result['data'].isNotEmpty) {
                            result['data']
                                .map((json) => json['config']['action']['value'])
                                .forEach((call) {
                                http.post('http://127.0.0.1:8080/rest/call', body: JSON.encode(call));
                            });
                        }
                    });
            });
}
