'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.get = get;
exports.post = post;

var _environment = require('./environment');

var _store = require('./store');

function getHeaders() {
    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    var _store$getState = _store.store.getState(),
        user = _store$getState.user;

    if (user && user.token) {
        headers.Authorization = user.token;
    }
    return headers;
}
function encodeQuery(query) {
    if (!query) return '';
    var queryParams = [];
    Object.entries(query).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            name = _ref2[0],
            value = _ref2[1];

        queryParams.push(name + '=' + encodeURIComponent(value));
    });
    if (!queryParams.length) return '';
    return '?' + queryParams.join('&');
}
function get(path) {
    var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return fetch(_environment.domain + path + encodeQuery(query), {
        headers: getHeaders()
    });
}
function post(path) {
    var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        query = _ref3.query;

    return fetch(_environment.domain + path + encodeQuery(query), {
        headers: getHeaders(),
        method: 'POST',
        body: JSON.stringify(body)
    });
}
//# sourceMappingURL=http.js.map
