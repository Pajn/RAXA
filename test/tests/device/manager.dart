library manager_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/device.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../helpers/database.dart';

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Manager', () {
        MockDb db;
        DeviceManager deviceManager;

        beforeEach(() {
            db = new MockDb();
            deviceManager = new DeviceManager(db);
        });

        describe('create', () {
            var testDevice = {
                '_id': 'SomeId',
                'name': 'SomeName',
                'plugin': 'SomePlugin',
                'deviceClass': 'SomeClass',
                'config': {
                    'someParameter': 'someValue'
                },
                'types': ['SomeType'],
                'implementedInterfaces': ['SomeInterface'],
                'status': {
                    'someStatus': 'someValue'
                },
                'variables': {
                    'someVariable': 'someValue'
                },
            };

            it('should use the Devices collection', () {
                var future = deviceManager.create(new Device.from(testDevice));

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query for the devices name', () {
                var future = deviceManager.create(new Device.from(testDevice));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'SomeName'}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should throw if found', () {
                db.mockCollection.fakedFind = testDevice;

                var future = deviceManager.create(new Device.from(testDevice));

                return future.catchError(expectAsync((error) {
                    expect(error).toEqual('Name already exist');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should create if not found', () {
                var future = deviceManager.create(new Device.from(testDevice));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.insertSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([testDevice]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });

        describe('read', () {
            it('should use the Devices collection', () {
                var future = deviceManager.read('DeviceId');

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query for specified device', () {
                var future = deviceManager.read('DeviceId');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'_id': 'DeviceId'}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should return found device', () {
                db.mockCollection.fakedFind = {
                    '_id': 'DeviceId',
                    'name': 'SomeName',
                    'plugin': 'SomePlugin',
                    'deviceClass': 'SomeClass',
                    'config': {
                        'someParameter': 'someValue'
                    },
                    'types': ['SomeType'],
                    'implementedInterfaces': ['SomeInterface'],
                    'status': {
                        'someStatus': 'someValue'
                    },
                    'variables': {
                        'someVariable': 'someValue'
                    },
                };

                var future = deviceManager.read('DeviceId');

                return future.then(expectAsync((device) {
                    expect(device).toBeA(Device);
                    expect(device).toEqual(db.mockCollection.fakedFind);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it("should return null when device isn't found", () {
                var future = deviceManager.read('DeviceId');

                return future.then(expectAsync((device) {
                    expect(device).toBeNull();

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });

        describe('readAll', () {
            it('should use the Devices collection', () {
                var future = deviceManager.readAll();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query for all devices', () {
                var future = deviceManager.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should return found devices', () {
                db.mockCollection.mockCursor.fakedFind = [
                    {
                        'name': 'DimLevel',
                        'methods': {
                            'level': {
                                'arguments': {
                                    'level': {
                                        'type': 'integer',
                                        'max': 'max',
                                        'min': 'min',
                                    }
                                }
                            },
                        },
                        'status': {
                            'level': {
                                'type': 'integer',
                                'max': 'max',
                                'min': 'min',
                            }
                        },
                        'variables': {
                            'max': {
                                'type': 'integer',
                            },
                            'min': {
                                'type': 'integer',
                            }
                        }
                    },
                    {
                        'name': 'Thermometer',
                        'methods': {},
                        'status': {
                            'temperature': {
                                'type': 'number',
                                'description': 'Temperature in celsius',
                                'max': 'max',
                                'min': 'min',
                            }
                        },
                        'variables': {
                            'resolution': {
                                'type': 'number',
                                'optional': true,
                            },
                            'updateFrequency': {
                                'type': 'number',
                                'description': 'Time between updates in minutes',
                                'optional': true
                            },
                            'max': {
                                'type': 'number',
                            },
                            'min': {
                                'type': 'number',
                            },
                        }
                    }
                ];

                var future = deviceManager.readAll();

                return future.then(expectAsync((devices) {
                    devices.forEach(expectAsync((device) {
                        expect(device).toBeA(Device);
                    }, count: devices.length));
                    expect(devices).toEqual(db.mockCollection.mockCursor.fakedFind);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });
    });
}
