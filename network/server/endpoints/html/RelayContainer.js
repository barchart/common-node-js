var Container = require('./../Container');
var RelayEndpoint = require('./RelayEndpoint');

module.exports = (() => {
	'use strict';

	class RelayContainer extends Container {
		constructor(port, path, secure) {
			super(port, path, secure);
		}

		_getEndpointType() {
			return RelayEndpoint;
		}

		toString() {
			return '[RelayContainer]';
		}
	}

	return RelayContainer;
})();