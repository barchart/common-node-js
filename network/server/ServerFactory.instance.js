var ExpressServerFactory = require('./express/ExpressServerFactory');

module.exports = function() {
    'use strict';

    return new ExpressServerFactory();
}();