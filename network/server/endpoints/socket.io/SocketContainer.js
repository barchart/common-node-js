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
            return SocketIOEndpoint;
        },

        toString: function() {
            return '[SocketContainer (name=' + this.getName() + ']';
        }
    });

    return SocketContainer;
}();