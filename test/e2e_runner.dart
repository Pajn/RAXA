import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:isolate';
import 'package:http/http.dart' as http;
import 'package:mongo_dart/mongo_dart.dart';
import 'package:unittest/unittest.dart' hide expect;
import 'tests/e2e/configuration.dart';

import 'tests/e2e/rest/devices.dart' as rest_devices_test;

/**
 * Make sure that the database is empty so that tests aren't accidentally
 * run on a production DB.
 */
Future checkEmpty(_) =>
    Future.wait([
        http.get('$HOST/rest/devices').then((response) {
            if (JSON.decode(response.body)['data'].length > 0) {
                throw 'There are devices in the database';
            }
        }),
        http.get('$HOST/rest/positions').then((response) {
            if (JSON.decode(response.body)['data'].length > 0) {
                throw 'There are positions in the database';
            }
        })
    ]);

main() {
    unittestConfiguration = new TestConfiguration()
        ..timeout = new Duration(seconds: 3);

    Isolate.spawnUri(new Uri.file('../bin/raxa.dart'),
        ['--config-file', 'tests/e2e/configuration.yaml'], null).then((_) =>
        // Wait for the server to start
        new Future.delayed(new Duration(seconds: 1))
    ).then(checkEmpty)
    .then((_) {
        // Now the tests can be run
        rest_devices_test.main();
    }).catchError((_) => exit(1));
}

class TestConfiguration extends SimpleConfiguration {
    void onDone(bool success) {
        exit(success ? 0 : 1);
        var db = new Db('mongodb://127.0.0.1/RAXA-E2E-Test');
        db.open().then((_) => db.drop());
    }
}
