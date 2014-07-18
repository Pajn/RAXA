part of raxa.common;

class Position extends ModelBase {
    /// A unique, auto generated id of the position.
    String get id => this['_id'];
    /// A unique name of the position. The name may change and thus can't be used as identification.
    String get name => this['name'];
    set name(String value) => this['name'] = value;

    /// Id of the parent [Position], is null if top-level.
    String get parent => this['parent'];
    set parent(String value) => this['parent'] = value;

    Position();
    Position.from(Map<String, dynamic> other, {removeId: false}) : super.from(other, removeId: removeId) {
        if (this['_id'].runtimeType.toString() == 'ObjectId') {
            this['_id'] = this['_id'].toHexString();
        }
    }
}
