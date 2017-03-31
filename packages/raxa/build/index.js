'use strict';

require('babel-polyfill');

var _app = require('./lib/server/app');

if (process.env.NODE_ENV !== 'production') {
    require('source-map-support/register');
}
process.on('unhandledRejection', function (reason, p) {
    console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason, reason && reason.stack);
});
(0, _app.main)();
//# sourceMappingURL=index.js.map
