"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.raxaError = raxaError;
function raxaError(error) {
    return Object.assign(new Error(JSON.stringify(error)), error);
}
//# sourceMappingURL=errors.js.map
