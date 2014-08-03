import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:raxa/plugin_helper.dart';

main(args, message) {
    var plugin = new Plugin(args, message)
        ..onCalled.listen((message) {
            if (message.call.interface == 'Scenario' && message.call.method == 'set') {
                message.device.config['scenario']['value'].forEach((call) =>
                    http.post('http://127.0.0.1:8080/rest/call', body: JSON.encode(call['value'])));
            }
        });
}
