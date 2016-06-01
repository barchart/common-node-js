var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');

var Endpoint = require('./../../Endpoint');

module.exports = function() {
	'use strict';

	var SocketEmitterEndpoint = Endpoint.extend({
		init: function(channel, event, command) {
			this._super(command);

			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(event, 'event', Event);

			this._channel = channel;
			this._event = event;
		},

		getChannel: function() {
			return this._channel;
		},

		getEvent: function() {
			return this._event;
		},

		toString: function() {
			return '[SocketEmitterEndpoint]';
		}
	});

	return SocketEmitterEndpoint;
}();