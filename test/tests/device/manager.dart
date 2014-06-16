library manager_test;

import 'package:guinness/guinness.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:raxa/device.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../helpers/database.dart';

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Manager', () {
        MockDb db;
        DeviceManager deviceManager;
        ObjectId id;

        beforeEach(() {
            db = new MockDb();
            deviceManager = new DeviceManager(db, new DeviceClassManager(db));
            id = new ObjectId();
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

        describe('delete', () {

            it('should use the Devices collection', () {
                var future = deviceManager.delete(id.toHexString());

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should remove the device by id', () {
                var future = deviceManager.delete(id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.removeSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'_id': id}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });

        describe('read', () {
            it('should use the Devices collection', () {
                var future = deviceManager.read(id.toHexString());

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query for specified device', () {
                var future = deviceManager.read(id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'_id': id}]);

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

                var future = deviceManager.read(id.toHexString());

                return future.then(expectAsync((device) {
                    expect(device).toBeA(Device);
                    expect(device).toEqual(db.mockCollection.fakedFind);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it("should return null when device isn't found", () {
                var future = deviceManager.read(id.toHexString());

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
                var id2 = new ObjectId();

                db.mockCollection.mockCursor.fakedFind = [
                    {
                        '_id': id.toHexString(),
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
                    },
                    {
                        '_id': id2.toHexString(),
                        'name': 'TestNexaSL',
                        'plugin': 'Nexa',
                        'deviceClass': 'NexaDimmableSelfLearning',
                        'config': {
                            'id': 'someValue'
                        },
                        'types': ['DimmableLamp', 'Lamp', 'Output'],
                        'implementedInterfaces': ['DimLevel', 'Switch'],
                        'status': {
                            'Switch': {
                                'on': true,
                            },
                            'DimLevel': {
                                'level': 7,
                            }
                        },
                        'variables': {
                            'min': 0,
                            'max': 15,
                        },
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
