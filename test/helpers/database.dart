library database_helpers;

import 'dart:async';
import 'package:guinness/guinness.dart';
import 'package:mock/mock.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:raxa/configuration.dart';

class MockDb extends Mock implements Database {
    MockCollection mockCollection;

    SpyFunction openSpy = guinness.createSpy('openSpy').andCallFake((_) => new Future.sync(() {}));
    SpyFunction closeSpy = guinness.createSpy('closeSpy');
    SpyFunction collectionSpy;

    MockDb() {
        mockCollection = new MockCollection();
        collectionSpy = guinness.createSpy('collectionSpy').andCallFake((_) => mockCollection);
    }

    Future connect(Function fn) {
        fn(this);

        return new Future.value(null);
    }

    open({writeConcern: null}) => openSpy(writeConcern);
    close() => closeSpy();
    collection(name) => collectionSpy(name);

    // Ignore warnings about unimplemented methods
    noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}


class MockCollection extends Mock implements DbCollection {
    MockCursor mockCursor;

    var fakedFind = null;
    var findCallback;
    var insertCallback = (_) => null;
    var updateCallback = (_, __) => null;

    SpyFunction findSpy;
    SpyFunction findOneSpy;
    SpyFunction insertSpy;
    SpyFunction removeSpy;
    SpyFunction updateSpy;

    MockCollection() {
        mockCursor = new MockCursor();

        findCallback = (_) => fakedFind;
        findSpy = guinness.createSpy('findSpy').andCallFake((_) => mockCursor);
        findOneSpy = guinness.createSpy('findOneSpy').andCallFake((q) => new Future.sync(() => findCallback(q)));

        insertSpy = guinness.createSpy('insertSpy').andCallFake((o) => new Future.sync(() => insertCallback(o)));
        removeSpy = guinness.createSpy('removeSpy');
        updateSpy = guinness.createSpy('updateSpy').andCallFake((q, o) => new Future.sync(() => updateCallback(q, o)));
    }

    find([selector]) => findSpy(selector);
    findOne([query]) => findOneSpy(query);
    insert(object, {writeConcern: null}) => insertSpy(object);
    remove([selector, writeConcern]) => removeSpy(selector);
    update(query, object, {writeConcern: null, upsert: false, multiUpdate: false}) => updateSpy(query, object);

    // Ignore warnings about unimplemented methods
    noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}


class MockCursor extends Mock implements Cursor {
    var fakedFind = [];

    SpyFunction forEachSpy;

    MockCursor() {
        forEachSpy = guinness.createSpy('forEachSpy').andCallFake((c) => new Future.sync(() => fakedFind.forEach(c)));
    }

    forEach(callback) => forEachSpy(callback);

    // Ignore warnings about unimplemented methods
    noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
