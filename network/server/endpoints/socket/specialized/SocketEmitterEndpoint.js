var CommandHandler = require('common/commands/CommandHandler');
var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');

var Endpoint = require('./../../Endpoint');

module.exports = function() {
	'use strict';

	var SocketEmitterEndpoint = Endpoint.extend({
		init: function(channel, event, eventType, roomQualifier) {
			this._super(emptyCommand);

			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(event, 'event', Event, 'Event');
			assert.argumentIsRequired(event, 'eventType', String);
			assert.argumentIsOptional(roomQualifier, 'roomQualifier', Function);

			this._channel = channel;
			this._event = event;
			this._eventType = eventType || null;
			this._roomQualifier = roomQualifier || getBroadcastRoom;
		},

		getChannel: function() {
			return this._channel;
		},

		getEvent: function() {
			return this._event;
		},

		getEventType: function() {
			return this._eventType;
		},

		getRoomQualifier: function() {
			return this._roomQualifier;
		},

		toString: function() {
			return '[SocketEmitterEndpoint]';
		}
	});

	var emptyCommand = CommandHandler.fromFunction(function() {
		return;
	});

	var getBroadcastRoom = function(ignored) {
		return null;
	};

	return SocketEmitterEndpoint;
}();