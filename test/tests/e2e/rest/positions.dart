library rest_positions_test;

import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:guinness/guinness.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../configuration.dart';

main() {
    describe('Positions', () {
        var positionIds = [];

        describe('post', () {
            var testPosition = {
                'name': 'TestPosition',
            };

            it('should be able to create positions', () =>
                http.post('$HOST/rest/positions', body: JSON.encode(testPosition)).then((response) {
                    expect(JSON.decode(response.body)).toEqual({
                        'data': 'Creation of position succeeded',
                        'status': 'success',
                        'version': '0.0.0',
                    });
                })
                .then((_) =>
                    http.post('$HOST/rest/positions', body: JSON.encode(
                        testPosition..['name'] = 'TestPosition2')
                    ).then((response) {
                        expect(JSON.decode(response.body)).toEqual({
                            'data': 'Creation of position succeeded',
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    })
                )
            );

            it('should not be able to create a position with the same name', () =>
                http.post('$HOST/rest/positions', body: JSON.encode(testPosition)).then((response) {
                    expect(JSON.decode(response.body)).toEqual({
                        'data': 'Creation of position failed',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                })
            );

            it('should not be able to create a position with a non existing plugin', () {
                testPosition['plugin'] = 'NonExistentPlugin';

                return http.post('$HOST/rest/positions', body: JSON.encode(testPosition)).then((response) {
                    expect(JSON.decode(response.body)).toEqual({
                        'data': 'Creation of position failed',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                });
            });

            it('should not be able to create a position with a non existing positionClass', () {
                testPosition['positionClass'] = 'NonExistentClass';

                return http.post('$HOST/rest/positions', body: JSON.encode(testPosition)).then((response) {
                    expect(JSON.decode(response.body)).toEqual({
                        'data': 'Creation of position failed',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                });
            });
        });

        describe('get', () {

            it('should be able to get all positions', () =>
                http.get('$HOST/rest/positions')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        positionIds = response['data'].map((position) => position['_id']).toList();
                        response['data'].forEach((position) => position['_id'] = '');

                        expect(response).toEqual({
                            'data': [
                                {
                                    'name': 'TestPosition',
                                    '_id': ''
                                },
                                {
                                    'name': 'TestPosition2',
                                    '_id': ''
                                }
                            ],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be able to get filtered positions', () {
                var query = Uri.encodeQueryComponent(JSON.encode({'name':'TestPosition'}));

                return http.get('$HOST/rest/positions?query=$query')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': [{
                                'name': 'TestPosition',
                                '_id': positionIds.first
                            }],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    });
            });

            it('should be return an empty response when to hard filter is used', () {
                var query = Uri.encodeQueryComponent(JSON.encode({'name':'NonExistentName'}));

                return http.get('$HOST/rest/positions?query=$query')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': [],
                        'status': 'success',
                        'version': '0.0.0',
                    });
                });
            });

            it('should be able to get a single positions', () =>
                http.get('$HOST/rest/positions/${positionIds.first}')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': {
                                'name': 'TestPosition',
                                '_id': positionIds.first
                            },
                            'status': 'success',
                            'version': '0.0.0',
                        });
                })
            );

            it('should be fail on getting a non existing position', () =>
                http.get('$HOST/rest/positions/${new ObjectId().toHexString()}')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': 'Position not found',
                        'status': 'fail',
                        'version': '0.0.0',
                    });
                })
            );
        });

        describe('put', () {

            it('should be able to change positions', () {
                var query = Uri.encodeQueryComponent(JSON.encode({'name':'TestPosition'}));

                return http.put('$HOST/rest/positions/${positionIds.last}', body: JSON.encode({
                        'name': 'TestedPosition',
                        'parent': positionIds.first
                    }))
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': 'Update of position succeeded',
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    })
                    .then((_) =>
                        http.get('$HOST/rest/positions/${positionIds.last}')
                            .then((response) => JSON.decode(response.body))
                            .then((response) {
                                expect(response).toEqual({
                                    'data': {
                                        'name': 'TestedPosition',
                                        'parent': positionIds.first,
                                        '_id': positionIds.last,
                                    },
                                    'status': 'success',
                                    'version': '0.0.0',
                                });
                            })
                    );
            });
        });

        describe('delete', () {

            it('should be able to delete positions', () {
                return http.delete('$HOST/rest/positions/${positionIds.first}')
                .then((response) => JSON.decode(response.body))
                .then((response) {
                    expect(response).toEqual({
                        'data': 'Deletion of position succeeded',
                        'status': 'success',
                        'version': '0.0.0',
                    });
                })
                .then((_) =>
                    http.get('$HOST/rest/positions/')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': [{
                                'name': 'TestedPosition',
                                'parent': positionIds.first,
                                '_id': positionIds.last,
                            }],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    })
                )
                .then((_) =>
                    http.delete('$HOST/rest/positions/${positionIds.last}')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': 'Deletion of position succeeded',
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    })
                )
                .then((_) {
                    http.get('$HOST/rest/positions/')
                    .then((response) => JSON.decode(response.body))
                    .then((response) {
                        expect(response).toEqual({
                            'data': [],
                            'status': 'success',
                            'version': '0.0.0',
                        });
                    });
                });
            });
        });
    });
}
