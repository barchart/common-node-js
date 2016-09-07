var CommandHandler = require('common/commands/CommandHandler');
var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');

var Endpoint = require('./../../Endpoint');

module.exports = function() {
	'use strict';

	var SocketEmitterEndpoint = Endpoint.extend({
		init: function(channel, event, eventType, roomCommand) {
			this._super(emptyCommand);

			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(event, 'event', Event, 'Event');
			assert.argumentIsRequired(eventType, 'eventType', String);
			assert.argumentIsOptional(roomCommand, 'roomCommand', CommandHandler, 'CommandHandler');

			this._channel = channel;
			this._event = event;
			this._eventType = eventType || null;
			this._roomCommand = roomCommand || broadcastCommand;
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

		getRoomCommand: function() {
			return this._roomCommand;
		},

		toString: function() {
			return '[SocketEmitterEndpoint]';
		}
	});

	var emptyCommand = CommandHandler.fromFunction(function() {
		return;
	});

	var broadcastCommand = CommandHandler.fromFunction(function() {
		return null;
	});

	return SocketEmitterEndpoint;
}();