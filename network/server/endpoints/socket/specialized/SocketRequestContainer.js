var Container = require('./../../Container');
var SocketRequestEndpoint = require('./SocketRequestEndpoint');

module.exports = function() {
	'use strict';

	var SocketRequestContainer = Container.extend({
		init: function(port, path, secure) {
			this._super(port, path, secure);
		},

		_getEndpointType: function() {
			return SocketRequestEndpoint;
		},

		toString: function() {
			return '[SocketRequestContainer]';
		}
	});

	return SocketRequestContainer;
}();