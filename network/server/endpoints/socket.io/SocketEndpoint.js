var assert = require('common/lang/assert');

var Endpoint = require('./../Endpoint');

module.exports = function() {
    'use strict';

    var SocketEndpoint = Endpoint.extend({
        init: function(command) {
            this._super(command);
        },

        toString: function() {
            return '[SocketEndpoint]';
        }
    });

    return SocketEndpoint;
}();