'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FormHelper = undefined;

var _ramda = require('ramda');

var _react = require('react');

var _reactMdl = require('react-mdl');

var _withState = require('recompose/withState');

var _withState2 = _interopRequireDefault(_withState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = require('./form-helper.scss');
var FormHelper = exports.FormHelper = (0, _withState2.default)('updatedObject', 'setUpdatedObject', null)(function (_ref) {
    var _ref$actions = _ref.actions,
        actions = _ref$actions === undefined ? null : _ref$actions,
        fields = _ref.fields,
        object = _ref.object,
        onSave = _ref.onSave,
        onUpdate = _ref.onUpdate,
        updatedObject = _ref.updatedObject,
        setUpdatedObject = _ref.setUpdatedObject,
        saveButton = _ref.saveButton,
        formId = _ref.formId,
        disabled = _ref.disabled;

    var changed = !!onUpdate;
    updatedObject = onUpdate ? object : updatedObject || object;
    return React.createElement("form", { id: formId, onSubmit: function onSubmit(e) {
            e.preventDefault();
            onSave(updatedObject);
        } }, fields.map(function (field, i) {
        if (!field) return null;
        if (field.props) return (0, _react.cloneElement)(field, { key: i });
        if ((0, _ramda.path)(field.path, updatedObject) !== (0, _ramda.path)(field.path, object)) {
            changed = true;
        }
        var value = (0, _ramda.path)(field.path, updatedObject);
        if (value === undefined) {
            value = '';
        }
        return React.createElement("div", { key: i }, React.createElement(_reactMdl.Textfield, Object.assign({ value: value, disabled: disabled, onChange: function onChange(e) {
                return (onUpdate || setUpdatedObject)((0, _ramda.set)((0, _ramda.lensPath)(field.path), e.target.value, updatedObject));
            } }, field)));
    }), saveButton && React.createElement(_reactMdl.Button, { disabled: !changed || disabled }, saveButton), "  ", actions);
});
//# sourceMappingURL=form-helper.js.map
