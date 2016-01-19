var when = require('when');

var Container = require('./../Container');
var SocketEndpoint = require('./SocketEndpoint');

module.exports = function() {
    'use strict';

    var SocketContainer = Container.extend({
        init: function (port, path, secure) {
            this._super(port, path, secure);
        },

        _getEndpointType: function() {
            return SocketEndpoint;
        },

        toString: function() {
            return '[SocketContainer]';
        }
    });

    return SocketContainer;
}();