library interface_manager_test;

import 'package:guinness/guinness.dart';
import 'package:raxa/interface.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../../helpers/database.dart';

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Manager', () {
        MockDb db;
        InterfaceManager interfaceManager;

        beforeEach(() {
            db = new MockDb();
            interfaceManager = new InterfaceManager(db);
        });

        describe('install', () {
            var testInterface = {
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
            };

            it('should use the Interfaces collection', () {
                var future = interfaceManager.install(new Interface.from(testInterface));

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Interfaces');
                }));
            });

            it('should query for the interfaces name', () {
                var future = interfaceManager.install(new Interface.from(testInterface));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'DimLevel'}]);
                }));
            });

            it('should throw if found', () {
                db.mockCollection.fakedFind = testInterface;

                var future = interfaceManager.install(new Interface.from(testInterface));

                return future.catchError(expectAsync((error) {
                    expect(error).toEqual('Interface already installed');
                }));
            });

            it('should install if not found', () {
                var future = interfaceManager.install(new Interface.from(testInterface));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.insertSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([testInterface]);
                }));
            });
        });

        describe('read', () {
            it('should use the Interfaces collection', () {
                var future = interfaceManager.read('InterfaceName');

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Interfaces');
                }));
            });

            it('should query for specified interface', () {
                var future = interfaceManager.read('InterfaceName');

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'InterfaceName'}]);
                }));
            });

            it('should return found interface', () {
                db.mockCollection.fakedFind = {
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
                };

                var future = interfaceManager.read('DimLevel');

                return future.then(expectAsync((interface) {
                    expect(interface).toBeA(Interface);
                    expect(interface).toEqual(db.mockCollection.fakedFind);
                }));
            });

            it("should return null when interface isn't found", () {
                var future = interfaceManager.read('InterfaceName');

                return future.then(expectAsync((interface) {
                    expect(interface).toBeNull();
                }));
            });
        });

        describe('readAll', () {
            it('should use the Interfaces collection', () {
                var future = interfaceManager.readAll();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Interfaces');
                }));
            });

            it('should query for all interfaces', () {
                var future = interfaceManager.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([null]);
                }));
            });

            it('should return found interfaces', () {
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

                var future = interfaceManager.readAll();

                return future.then(expectAsync((interfaces) {
                    interfaces.forEach(expectAsync((interface) {
                        expect(interface).toBeA(Interface);
                    }, count: interfaces.length));
                    expect(interfaces).toEqual(db.mockCollection.mockCursor.fakedFind);
                }));
            });
        });
    });
}
