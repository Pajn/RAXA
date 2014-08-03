library manager_test;

import 'package:guinness/guinness.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:raxa/common.dart';
import 'package:raxa/position.dart';
import 'package:unittest/unittest.dart' hide expect;
import '../../../helpers/database.dart';
import '../../../helpers/event.dart';

main() {
    unittestConfiguration.timeout = new Duration(seconds: 3);

    describe('Manager', () {
        MockDb db;
        MockEventBus bus;
        PositionManager positionManager;
        ObjectId id;

        beforeEach(() {
            db = new MockDb();
            bus = new MockEventBus();
            positionManager = new PositionManager(db, bus);
            id = new ObjectId();
        });

        describe('create', () {
            var testPosition;

            beforeEach(() {
                testPosition = {
                    '_id': 'SomeId',
                    'name': 'SomeName',
                    'parent': 'SomeParent',
                };
            });

            it('should validate the position', () {
                testPosition['name'] = '';

                var future = positionManager.create(new Position.from(testPosition));

                return future.catchError(expectAsync((error) {
                    expect(error).toEqual('Position is not valid');
                }));
            });

            it('should use the Positions collection', () {
                var future = positionManager.create(new Position.from(testPosition));

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Positions');
                }));
            });

            it('should query for the positions name', () {
                var future = positionManager.create(new Position.from(testPosition));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'name': 'SomeName'}]);
                }));
            });

            it('should throw if found', () {
                db.mockCollection.fakedFind = testPosition;

                var future = positionManager.create(new Position.from(testPosition));

                return future.catchError(expectAsync((error) {
                    expect(error).toEqual('Name already exist');
                }));
            });

            it('should create if not found', () {
                var future = positionManager.create(new Position.from(testPosition));

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.insertSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([testPosition]);
                }));
            });

            it('should emit an event when created', () {
                var future = positionManager.create(new Position.from(testPosition));

                return future.then(expectAsync((_) {
                    var arguments = bus.addSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first['data']['_id']).not.toEqual('SomeId');
                    // Clear id to be testable
                    arguments.first['data']['_id'] = '';
                    expect(arguments).toEqual([{
                        'type': 'Position',
                        'event': 'created',
                        'data': {
                            '_id': '',
                            'name': 'SomeName',
                            'parent': 'SomeParent',
                        },
                        'command': 'Event'
                    }]);
                }));
            });
        });

        describe('delete', () {

            it('should use the Positions collection', () {
                var future = positionManager.delete(id.toHexString());

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Positions');
                }));
            });

            it('should remove the position by id', () {
                var future = positionManager.delete(id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.removeSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'_id': id}]);
                }));
            });

            it('should emit an event when deleted', () {
                var future = positionManager.delete(id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = bus.addSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{
                        'type': 'Position',
                        'event': 'deleted',
                        'data': id.toHexString(),
                        'command': 'Event'
                    }]);
                }));
            });
        });

        describe('read', () {
            it('should use the Positions collection', () {
                var future = positionManager.read(id.toHexString());

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Positions');
                }));
            });

            it('should query for specified position', () {
                var future = positionManager.read(id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findOneSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{'_id': id}]);
                }));
            });

            it('should return found position', () {
                db.mockCollection.fakedFind = {
                    '_id': 'SomeId',
                    'name': 'SomeName',
                    'parent': 'SomeParent',
                };

                var future = positionManager.read(id.toHexString());

                return future.then(expectAsync((position) {
                    expect(position).toBeA(Position);
                    expect(position).toEqual(db.mockCollection.fakedFind);
                }));
            });

            it("should return null when position isn't found", () {
                var future = positionManager.read(id.toHexString());

                return future.then(expectAsync((position) {
                    expect(position).toBeNull();
                }));
            });
        });

        describe('readAll', () {
            it('should use the Positions collection', () {
                var future = positionManager.readAll();

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Positions');
                }));
            });

            it('should query for all positions', () {
                var future = positionManager.readAll();

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.findSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{}]);
                }));
            });

            it('should return found positions', () {
                var id2 = new ObjectId();

                db.mockCollection.mockCursor.fakedFind = [
                    {
                        '_id': id.toHexString(),
                        'name': 'SomeName',
                        'parent': 'SomeParent',
                    },
                    {
                        '_id': id2.toHexString(),
                        'name': 'SomeOtherName',
                        'parent': id.toHexString(),
                    }
                ];

                var future = positionManager.readAll();

                return future.then(expectAsync((positions) {
                    positions.forEach(expectAsync((position) {
                        expect(position).toBeA(Position);
                    }, count: positions.length));
                    expect(positions).toEqual(db.mockCollection.mockCursor.fakedFind);
                }));
            });
        });

        describe('update', () {
            var changed = {
                'name': 'SomeOtherName'
            };

            it('should use the Positions collection', () {
                var future = positionManager.update(changed, id.toHexString());

                return future.then(expectAsync((_) {
                    expect(db.collectionSpy).toHaveBeenCalledOnceWith('Positions');
                }));
            });

            it('should query for the position id', () {
                var future = positionManager.update(changed, id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.first).toEqual({'_id': id});
                }));
            });

            it('should update with provided values', () {
                var future = positionManager.update(changed, id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = db.mockCollection.updateSpy.mostRecentCall.positionalArguments;
                    expect(arguments.last).toEqual({r'$set': changed});
                }));
            });

            it('should emit an event when updated', () {
                var future = positionManager.update(changed, id.toHexString());

                return future.then(expectAsync((_) {
                    var arguments = bus.addSpy.mostRecentCall.positionalArguments;
                    expect(arguments).toEqual([{
                        'type': 'Position',
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
