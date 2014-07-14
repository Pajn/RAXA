library class_manager_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/api.dart';
import 'package:raxa/common.dart';
import 'package:raxa/device.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../helpers/database.dart';

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('ClassManager', () {
        MockDb db;
        DeviceClassManager deviceClassManager;

        beforeEach(() {
            db = new MockDb();
            deviceClassManager = new DeviceClassManager(db, new EventBus());
        });

        describe('install', () {
            var testDeviceClass = {
                'name': 'SomeName',
                'plugin': 'SomePlugin',
                'config': {
                    'someParameter': 'someValue'
                },
                'implementedInterfaces': ['SomeInterface'],
                'requiredInterfaces': ['SomeOtherInterface'],
            };

            it('should use the DeviceClasses collection', () {
                var future = deviceClassManager.install(new DeviceClass.from(testDeviceClass));

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('DeviceClasses');
                }));
            });

            it('should query for the deviceClass name and plugin', () {
                var future = deviceClassManager.install(new DeviceClass.from(testDeviceClass));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'SomeName', 'plugin': 'SomePlugin'}]);
                }));
            });

            it('should throw if found', () {
                db.mockCollection.fakedFind = testDeviceClass;

                var future = deviceClassManager.install(new DeviceClass.from(testDeviceClass));

                return future.catchError(expectAsync((error) {
                    expect(error).toEqual('DeviceClass already installed');
                }));
            });

            it('should install if not found', () {
                var future = deviceClassManager.install(new DeviceClass.from(testDeviceClass));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.insertSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([testDeviceClass]);
                }));
            });
        });

        describe('read', () {
            it('should use the DeviceClasses collection', () {
                var future = deviceClassManager.read('PluginName', 'DeviceClassName');

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('DeviceClasses');
                }));
            });

            it('should query for specified deviceClass', () {
                var future = deviceClassManager.read('PluginName', 'DeviceClassName');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'DeviceClassName', 'plugin': 'PluginName'}]);
                }));
            });

            it('should return found deviceClass', () {
                db.mockCollection.fakedFind = {
                    'name': 'DeviceClassName',
                    'plugin': 'PluginName',
                    'config': {
                        'someParameter': 'someValue'
                    },
                    'implementedInterfaces': ['SomeInterface'],
                    'requiredInterfaces': ['SomeOtherInterface'],
                };

                var future = deviceClassManager.read('PluginName', 'DeviceClassName');

                return future.then(expectAsync((deviceClass) {
                    expect(deviceClass).toBeA(DeviceClass);
                    expect(deviceClass).toEqual(db.mockCollection.fakedFind);
                }));
            });

            it("should return null when deviceClass isn't found", () {
                var future = deviceClassManager.read('PluginName', 'DeviceClassName');

                return future.then(expectAsync((deviceClass) {
                    expect(deviceClass).toBeNull();
                }));
            });
        });

        describe('readAll', () {
            it('should use the DeviceClasses collection', () {
                var future = deviceClassManager.readAll();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('DeviceClasses');
                }));
            });

            it('should query for all deviceClasses', () {
                var future = deviceClassManager.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{}]);
                }));
            });

            it('should return found deviceClasses', () {
                db.mockCollection.mockCursor.fakedFind = [
                    {
                        'name': 'NexaDimmableSelfLearning',
                        'plugin': 'Nexa',
                        'types': ['DimmableLamp', 'Lamp', 'Output'],
                        'implementedInterfaces': ['DimLevel', 'Switch'],
                        'variables': {
                            'DimLevel': {
                                'min': 0,
                                'max': 15,
                            },
                        },
                    },
                    {
                        'name': 'NexaOnOffSelfLearning',
                        'plugin': 'Nexa',
                        'types': ['Lamp', 'Output'],
                        'implementedInterfaces': ['Switch'],
                    }
                ];

                var future = deviceClassManager.readAll();

                return future.then(expectAsync((deviceClasses) {
                    deviceClasses.forEach(expectAsync((deviceClass) {
                        expect(deviceClass).toBeA(DeviceClass);
                    }, count: deviceClasses.length));
                    expect(deviceClasses).toEqual(db.mockCollection.mockCursor.fakedFind);
                }));
            });
        });
    });
}
