var Container = require('./../../Container');
var SocketEmitterEndpoint = require('./SocketEmitterEndpoint');

module.exports = (() => {
	'use strict';

	class SocketEmitterContainer extends Container {
		constructor(port, path, secure) {
			super(port, path, secure);
		}

		_getEndpointType() {
			return SocketEmitterEndpoint;
		}

		toString() {
			return '[SocketEmitterContainer]';
		}
	}

	return SocketEmitterContainer;
})();