var CommandHandler = require('common/commands/CommandHandler');
var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');

var Endpoint = require('./../../Endpoint');

module.exports = function() {
	'use strict';

	var SocketSubscriptionEndpoint = Endpoint.extend({
		init: function(channel, roomsCommand, responseCommand, responseEventType) {
			this._super(emptyCommand);

			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(roomsCommand, 'roomsCommand', CommandHandler, 'CommandHandler');
			assert.argumentIsOptional(responseCommand, 'responseCommand', CommandHandler, 'CommandHandler');
			assert.argumentIsOptional(responseEventType, 'responseEventType', String);

			this._channel = channel;
			this._roomsCommand = roomsCommand;

			this._responseCommand = responseCommand || emptyCommand;
			this._responseEventType = responseEventType || '';
		},

		getChannel: function() {
			return this._channel;
		},

		getRoomsCommand: function() {
			return this._roomsCommand;
		},

		getResponseCommand: function() {
			return this._responseCommand;
		},

		getResponseEventType: function() {
			return this._responseEventType;
		},

		toString: function() {
			return '[SocketSubscriptionEndpoint]';
		}
	});

	var emptyCommand = CommandHandler.fromFunction(function() {
		return null;
	});

	return SocketSubscriptionEndpoint;
}();