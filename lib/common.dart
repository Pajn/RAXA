library raxa.common;

import 'dart:collection';

/**
 * A base class for models that extends [MapBase] as all models is JSON based.
 */
abstract class ModelBase extends MapBase<String, dynamic> {
    Map _map;

    Iterable<String> get keys => _map.keys;

    /**
     * Create an instance from a JSON object.
     *
     * Set parameter [removeId] to false if you don't want to remove the _id
     * field added by mongodb.
     */
    ModelBase.from(Map<String, dynamic> other, {bool removeId: true}) {
        _map = other;

        if (removeId) {
            _map.remove('_id');
        }
    }

    operator [](String key) => _map[key];
    operator []=(String key, value) => _map[key] = value;

    /**
     * Returns the value if [key] exists, or the [defaultValue] if not.
     */
    getValue(String key, defaultValue) => _map[key] != null ? _map[key] : defaultValue;

    clear() => _map.clear();
    remove(String key) => _map.remove(key);
}
