var assert = require('common/lang/assert');

var Endpoint = require('./../../Endpoint');

module.exports = (() => {
	'use strict';

	class SocketRequestEndpoint extends Endpoint {
		constructor(channel, command) {
			super(command);

			assert.argumentIsRequired(channel, 'channel', String);

			this._channel = channel;
		}

		getChannel() {
			return this._channel;
		}

		toString() {
			return '[SocketRequestEndpoint]';
		}
	}

	return SocketRequestEndpoint;
})();