library plugin_manager_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/plugin.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../helpers/database.dart';

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Plugin/Manager', () {
        MockDb db;
        PluginManager pluginManager;

        beforeEach(() {
            db = new MockDb();
            pluginManager = new PluginManager(db);
        });

        describe('read', () {
            it('should use the Plugins collection', () {
                var future = pluginManager.read('PluginName');

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Plugins');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query with specified plugin', () {
                var future = pluginManager.read('PluginName');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'PluginName'}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
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

                return future.then(expectAsync((group) {
                    expect(group).toEqual(db.mockCollection.fakedFind);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it("should return null when plugin isn't found", () {
                var future = pluginManager.read('PluginName');

                return future.then(expectAsync((group) {
                    expect(group).toBeNull();

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });

        describe('readAll', () {
            it('should use the Plugins collection', () {
                var future = pluginManager.readAll();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Plugins');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query for all plugins', () {
                var future = pluginManager.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([null]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should return found groups', () {
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

                var expected = [
                    {
                        'name': 'PluginName',
                        'version': '0.1.2',
                        'apiVersion': '0.1.1',
                        'enabled': true,
                        'descriptionSummary': 'Plugin for testing',
                    },
                    {
                        'name': 'Plugin',
                        'version': '2.1.0',
                        'apiVersion': '0.1.1',
                        'enabled': false,
                        'descriptionSummary': 'Plugin for testing',
                    }
                ];

                var future = pluginManager.readAll();

                return future.then(expectAsync((groups) {
                    expect(groups).toEqual(expected);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });
    });
}
