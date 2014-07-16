library configuration_settings_test;

import 'dart:async';
import 'package:guinness/guinness.dart';
import 'package:raxa/api.dart';
import 'package:raxa/configuration.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../helpers/database.dart';
import '../../helpers/event.dart';

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Configuration/Settings', () {
        MockDb db;
        MockEventBus bus;
        Settings settings;

        beforeEach(() {
            db = new MockDb();
            bus = new MockEventBus();
            settings = new Settings(db, bus);
        });

        describe('load', () {
            it('should use the Settings collection', () {
                db.mockCollection.fakedFind = new Future.value(null);

                var future = settings.load({});

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Settings');
                }));
            });

            it('should query with core as default group', () {
                var future = settings.load({});

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'group': 'core'}]);
                }));
            });

            it('should query with specified group', () {
                var future = settings.load({}, 'Plugin');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'group': 'Plugin'}]);
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
                }));
            });
        });

        describe('read', () {
            it('should use the Settings collection', () {
                var future = settings.read();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Settings');
                }));
            });

            it('should query for core as default group', () {
                var future = settings.read();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'group': 'core'}]);
                }));
            });

            it('should query for specified group', () {
                var future = settings.read('Plugin');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'group': 'Plugin'}]);
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
                }));
            });

            it("should return null when group isn't found", () {
                var future = settings.read();

                return future.then(expectAsync((group) {
                    expect(group).toBeNull();
                }));
            });
        });

        describe('readAll', () {
            it('should use the Settings collection', () {
                var future = settings.readAll();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Settings');
                }));
            });

            it('should query for all groups', () {
                var future = settings.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([null]);
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
                }));
            });
        });

        describe('save', () {
            it('should use the Settings collection', () {
                var future = settings.save({});

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Settings');
                }));
            });

            it('should query for core as default group', () {
                var future = settings.save({});

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first).toEqual({'group': 'core'});
                }));
            });

            it('should query for specified group', () {
                var future = settings.save({}, 'Plugin');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first).toEqual({'group': 'Plugin'});
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
                }));
            });

            it('should emit an event when saved', () {
                var updatedSettings = {
                    'group': 'core',
                    'version': '0.1.2',
                    'settings': {
                        'key': 'value'
                    }
                };

                var future = settings.save(updatedSettings);

                return future.then(expectAsync((_) {
                    var arguments = bus.addSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{
                        'type': 'Settings',
                        'event': 'updated',
                        'data': {
                            'group': 'core',
                            'settings': updatedSettings,
                        },
                        'command': 'Event'
                    }]);
                }));
            });
        });
    });
}
