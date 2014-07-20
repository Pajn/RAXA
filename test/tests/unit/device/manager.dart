library manager_test;

import 'dart:async';
import 'package:guinness/guinness.dart';
import 'package:mock/mock.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:raxa/api.dart';
import 'package:raxa/common.dart';
import 'package:raxa/device.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../../helpers/database.dart';
import '../../../helpers/event.dart';

class MockDeviceClassManager extends Mock implements DeviceClassManager {
    DeviceClass fakedRead;

    Future<DeviceClass> read(String plugin, String name) =>
        new Future.value(fakedRead);

    noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Manager', () {
        MockDb db;
        MockDeviceClassManager deviceClassManager;
        MockEventBus bus;
        DeviceManager deviceManager;
        ObjectId id;

        beforeEach(() {
            db = new MockDb();
            deviceClassManager = new MockDeviceClassManager();
            bus = new MockEventBus();
            deviceManager = new DeviceManager(db, deviceClassManager, bus);
            id = new ObjectId();

            deviceClassManager.fakedRead = new DeviceClass.from({
                'name': 'DeviceClassName',
                'plugin': 'PluginName',
                'config': {
                    'someParameter': 'someValue'
                },
                'implementedInterfaces': ['SomeInterface'],
                'requiredInterfaces': ['SomeOtherInterface'],
            });
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
                }));
            });

            it('should query for the devices name', () {
                var future = deviceManager.create(new Device.from(testDevice));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'SomeName'}]);
                }));
            });

            it('should throw if found', () {
                db.mockCollection.fakedFind = testDevice;

                var future = deviceManager.create(new Device.from(testDevice));

                return future.catchError(expectAsync((error) {
                    expect(error).toEqual('Name already exist');
                }));
            });

            it('should throw if device class is not found', () {
                deviceClassManager.fakedRead = null;

                var future = deviceManager.create(new Device.from(testDevice));

                return future.catchError(expectAsync((error) {
                    expect(error).toEqual('Specified DeviceClass does not exist');
                }));
            });

            it('should create if not found', () {
                var future = deviceManager.create(new Device.from(testDevice));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.insertSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([testDevice]);
                }));
            });

            it('should emit an event when created', () {
                var future = deviceManager.create(new Device.from(testDevice));

                return future.then(expectAsync((_) {
                    var arguments = bus.addSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first['data']['_id']).not.toEqual('SomeId');
                    // Clear id to be testable
                    arguments.first['data']['_id'] = '';
                    expect(arguments).toEqual([{
                        'type': 'Device',
                        'event': 'created',
                        'data': {
                            '_id': '',
                            'name': 'SomeName',
                            'plugin': 'SomePlugin',
                            'deviceClass': 'SomeClass',
                            'config': {
                                'someParameter': 'someValue'
                            },
                            'implementedInterfaces': ['SomeInterface'],
                            'status': {
                                'someStatus': 'someValue'
                            },
                            'variables': {}
                        },
                        'command': 'Event'
                    }]);
                }));
            });
        });

        describe('delete', () {

            it('should use the Devices collection', () {
                var future = deviceManager.delete(id.toHexString());

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');
                }));
            });

            it('should remove the device by id', () {
                var future = deviceManager.delete(id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.removeSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'_id': id}]);
                }));
            });

            it('should emit an event when deleted', () {
                var future = deviceManager.delete(id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = bus.addSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{
                        'type': 'Device',
                        'event': 'deleted',
                        'data': id.toHexString(),
                        'command': 'Event'
                    }]);
                }));
            });
        });

        describe('read', () {
            it('should use the Devices collection', () {
                var future = deviceManager.read(id.toHexString());

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');
                }));
            });

            it('should query for specified device', () {
                var future = deviceManager.read(id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'_id': id}]);
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
                }));
            });

            it("should return null when device isn't found", () {
                var future = deviceManager.read(id.toHexString());

                return future.then(expectAsync((device) {
                    expect(device).toBeNull();
                }));
            });
        });

        describe('readAll', () {
            it('should use the Devices collection', () {
                var future = deviceManager.readAll();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');
                }));
            });

            it('should query for all devices', () {
                var future = deviceManager.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{}]);
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
                                'off': false,
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
                }));
            });
        });

        describe('update', () {
            var changed = {
                'name': 'SomeOtherName'
            };

            it('should use the Devices collection', () {
                var future = deviceManager.update(changed, id.toHexString());

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Devices');
                }));
            });

            it('should query for the device id', () {
                var future = deviceManager.update(changed, id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first).toEqual({'_id': id});
                }));
            });

            it('should update with provided values', () {
                var future = deviceManager.update(changed, id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.last).toEqual({r'$set': changed});
                }));
            });

            it('should emit an event when updated', () {
                var future = deviceManager.update(changed, id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = bus.addSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{
                        'type': 'Device',
                        'event': 'updated',
                        'data': {
                            'id': id.toHexString(),
                            'changed': changed
                        },
                        'command': 'Event'
                    }]);
                }));
            });
        });
    });
}
