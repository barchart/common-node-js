var Container = require('./../../Container');
var SocketEmitterEndpoint = require('./SocketEmitterEndpoint');

module.exports = function() {
	'use strict';

	var SocketEmitterContainer = Container.extend({
		init: function(port, path, secure) {
			this._super(port, path, secure);
		},

		_getEndpointType: function() {
			return SocketEmitterEndpoint;
		},

		toString: function() {
			return '[SocketEmitterContainer]';
		}
	});

	return SocketEmitterContainer;
}();