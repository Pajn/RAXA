library plugin_manager_test;

import 'package:guinness/guinness.dart';
import 'package:mock/mock.dart';
import 'package:raxa/api.dart';
import 'package:raxa/common.dart';
import 'package:raxa/device.dart';
import 'package:raxa/interface.dart';
import 'package:raxa/plugin.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../helpers/database.dart';
import '../../helpers/event.dart';

class MockPluginInstance extends Mock implements PluginInstance {
    var sendSpy = guinness.createSpy('sendSpy');

    send(message) => sendSpy(message);

    // Ignore warnings about unimplemented methods
    noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Plugin/Manager', () {
        MockDb db;
        MockEventBus bus;
        PluginManager pluginManager;

        beforeEach(() {
            db = new MockDb();
            bus = new MockEventBus();
            pluginManager = new PluginManager(db, new DeviceClassManager(db, new EventBus()),
                            new InterfaceManager(db), bus);
        });

        describe('call', () {
            MockPluginInstance pluginOne;
            MockPluginInstance pluginTwo;
            Call call;
            Device device;

            beforeEach(() {
                pluginOne = new MockPluginInstance();
                pluginTwo = new MockPluginInstance();
                call = new Call();
                device = new Device()..plugin='PluginOne';

                pluginManager.enabledPlugins = {
                    'PluginOne': pluginOne,
                    'PluginTwo': pluginTwo
                };
            });

            it('should send a CallMessage to the correct plugin instance', () {
                pluginManager.call(call, device);

                expect(pluginOne.sendSpy).toHaveBeenCalledOnce();
                var arguments = pluginOne.sendSpy.calls.last.positionalArguments;
                expect(arguments).toEqual([new CallMessage(call, device)]);

                expect(pluginTwo.sendSpy).not.toHaveBeenCalled();
            });
        });

        describe('read', () {
            it('should use the Plugins collection', () {
                var future = pluginManager.read('PluginName');

                return future.then(expectAsync((_) {
                    // TODO: Called in constructor as well
                    expect(db.collectionSpy).toHaveBeenCalledWith('Plugins');
                }));
            });

            it('should query for specified plugin', () {
                var future = pluginManager.read('PluginName');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'PluginName'}]);
                }));
            });

            it('should return found plugin', () {
                db.mockCollection.fakedFind = {
                    'name': 'PluginName',
                    'version': '0.1.2',
                    'apiVersion': '0.1.1',
                    'enabled': true,
                    'descriptionSummary': 'Plugin for testing',
                    'description': 'A plugin used for testing',
                };

                var future = pluginManager.read('PluginName');

                return future.then(expectAsync((plugin) {
                    expect(plugin).toEqual(db.mockCollection.fakedFind);
                }));
            });

            it("should return null when plugin isn't found", () {
                var future = pluginManager.read('PluginName');

                return future.then(expectAsync((plugin) {
                    expect(plugin).toBeNull();
                }));
            });
        });

        describe('readAll', () {
            it('should use the Plugins collection', () {
                var future = pluginManager.readAll();

                return future.then(expectAsync((_) {
                    // TODO: Called in constructor as well
                    expect(db.collectionSpy).toHaveBeenCalledWith('Plugins');
                }));
            });

            it('should query for all plugins', () {
                var future = pluginManager.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{}]);
                }));
            });

            it('should return found plugins', () {
                db.mockCollection.mockCursor.fakedFind = [
                    {
                        'name': 'PluginName',
                        'version': '0.1.2',
                        'apiVersion': '0.1.1',
                        'enabled': true,
                        'descriptionSummary': 'Plugin for testing',
                        'description': 'A plugin used for testing',
                    },
                    {
                        'name': 'Plugin',
                        'version': '2.1.0',
                        'apiVersion': '0.1.1',
                        'enabled': false,
                        'descriptionSummary': 'Plugin for testing',
                        'description': 'Another plugin used for testing',
                    }
                ];

                var future = pluginManager.readAll();

                return future.then(expectAsync((plugins) {
                    expect(plugins).toEqual(db.mockCollection.mockCursor.fakedFind);
                }));
            });
        });

        describe('update', () {
            it('should use the Plugins collection', () {
                var future = pluginManager.update({'enabled': true}, 'PluginName');

                return future.then(expectAsync((_) {
                    // TODO: Called in constructor as well
                    expect(db.collectionSpy).toHaveBeenCalledWith('Plugins');
                }));
            });

            it('should query for specified plugin', () {
                var future = pluginManager.update({'enabled': true}, 'PluginName');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first).toEqual({'name': 'PluginName'});
                }));
            });

            it('should update the plugin info', () {
                var updatedInfo = {'enabled': true};

                var future = pluginManager.update(updatedInfo, 'PluginName');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments[1]).toEqual({r'$set': updatedInfo});
                }));
            });

            it('should emit an event when updated', () {
                var updatedInfo = {'enabled': true};

                var future = pluginManager.update(updatedInfo, 'PluginName');

                return future.then(expectAsync((_) {
                    var arguments = bus.addSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{
                        'type': 'Plugin',
                        'event': 'updated',
                        'data': {
                            'name': 'PluginName',
                            'changed': { 'enabled': true }
                        },
                        'command': 'Event'
                    }]);
                }));
            });
        });
    });
}
