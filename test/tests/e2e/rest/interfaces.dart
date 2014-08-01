library rest_interfaces_test;

import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:guinness/guinness.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../configuration.dart';

main() {
    describe('Interfaces', () {

        describe('get', () {

            it('should be able to get all interfaces', () =>
                http.get('$HOST/rest/interfaces')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {

                        expect(response).toEqual({
                            'data': [
                                {
                                    'name': 'TestInterface',
                                }
                            ],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be able to get a single interface', () =>
                http.get('$HOST/rest/interfaces/TestInterface')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': {
                                'name': 'TestInterface',
                            },
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be fail on getting a non existing interface', () =>
                http.get('$HOST/rest/interfaces/NonExistentInterface')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': 'Interface not found',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                })
            );
        });
    });
}
