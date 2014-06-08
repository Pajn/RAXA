library configuration_settings_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/configuration.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../helpers/database.dart';

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Configuration/Settings', () {
        MockDb db;
        Settings settings;

        beforeEach(() {
            db = new MockDb();
            settings = new Settings(db);
        });

        describe('load', () {
            it('should use the Settings collection', () {
                var future = settings.load({});

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Settings');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query with core as default group', () {
                var future = settings.load({});

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'group': 'core'}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query with specified group', () {
                var future = settings.load({}, 'Plugin');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'group': 'Plugin'}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should return found group', () {
                db.mockCollection.fakedFind = {
                    'group': 'core',
                    'version': '0.1.2',
                    'settings': {
                        'key': 'value'
                    }
                };

                var future = settings.load({});

                return future.then(expectAsync((group) {
                    expect(group).toEqual(db.mockCollection.fakedFind);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should insert default when group not found, and return it', () {
                var defaultSettings = {
                    'group': 'core',
                    'version': '0.1.2',
                    'settings': {
                        'key': 'value'
                    }
                };

                var future = settings.load(defaultSettings);

                return future.then(expectAsync((group) {
                    var arguments = db.mockCollection.insertSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([defaultSettings]);
                    expect(group).toEqual(defaultSettings);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });

        describe('read', () {
            it('should use the Settings collection', () {
                var future = settings.read();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Settings');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query with core as default group', () {
                var future = settings.read();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'group': 'core'}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query with specified group', () {
                var future = settings.read('Plugin');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'group': 'Plugin'}]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should return found group', () {
                db.mockCollection.fakedFind = {
                    'group': 'core',
                    'version': '0.1.2',
                    'settings': {
                        'key': 'value'
                    }
                };

                var future = settings.read();

                return future.then(expectAsync((group) {
                    expect(group).toEqual(db.mockCollection.fakedFind);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it("should return null when group isn't found", () {
                var future = settings.read();

                return future.then(expectAsync((group) {
                    expect(group).toBeNull();

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });

        describe('readAll', () {
            it('should use the Settings collection', () {
                var future = settings.readAll();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Settings');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query for all groups', () {
                var future = settings.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([null]);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should return found groups', () {
                db.mockCollection.mockCursor.fakedFind = [
                    {
                        'group': 'core',
                        'version': '0.1.2',
                        'settings': {
                            'key': 'value'
                        }
                    },
                    {
                        'group': 'Plugin',
                        'version': '2.1.0',
                        'settings': {
                            'key': 'value'
                        }
                    }
                ];

                var expected = {
                    'core': {
                        'version': '0.1.2',
                        'settings': {
                            'key': 'value'
                        }
                    },
                    'Plugin': {
                        'version': '2.1.0',
                        'settings': {
                            'key': 'value'
                        }
                    }
                };

                var future = settings.readAll();

                return future.then(expectAsync((groups) {
                    expect(groups).toEqual(expected);

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });

        describe('save', () {
            it('should use the Settings collection', () {
                var future = settings.save({});

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Settings');

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query with core as default group', () {
                var future = settings.save({});

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first).toEqual({'group': 'core'});

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should query with specified group', () {
                var future = settings.save({}, 'Plugin');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first).toEqual({'group': 'Plugin'});

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });

            it('should update the group', () {
                var updatedSettings = {
                    'group': 'core',
                    'version': '0.1.2',
                    'settings': {
                        'key': 'value'
                    }
                };

                var future = settings.save(updatedSettings);

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments[1]).toEqual({r'$set': updatedSettings});

                    expect(db.closeSpy).toHaveBeenCalledOnce();
                }));
            });
        });
    });
}
