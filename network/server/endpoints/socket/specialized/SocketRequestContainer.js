var Container = require('./../../Container');
var SocketRequestEndpoint = require('./SocketRequestEndpoint');

module.exports = function() {
	'use strict';

	class SocketRequestContainer extends Container {
		constructor(port, path, secure) {
			super(port, path, secure);
		}

		_getEndpointType() {
			return SocketRequestEndpoint;
		}

		toString() {
			return '[SocketRequestContainer]';
		}
	}

	return SocketRequestContainer;
}();