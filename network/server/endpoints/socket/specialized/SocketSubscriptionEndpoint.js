var CommandHandler = require('common/commands/CommandHandler');
var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');

var Endpoint = require('./../../Endpoint');

module.exports = function() {
	'use strict';

	var SocketSubscriptionEndpoint = Endpoint.extend({
		init: function(channel, roomCommand, responseCommand, responseEventType) {
			this._super(emptyCommand);

			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(roomCommand, 'roomCommand', CommandHandler, 'CommandHandler');
			assert.argumentIsOptional(responseCommand, 'responseCommand', CommandHandler, 'CommandHandler');
			assert.argumentIsOptional(responseEventType, 'responseEventType', String);
			
			this._channel = channel;
			this._roomCommand = roomCommand;
			
			this._responseCommand = responseCommand || emptyCommand;
			this._responseEventType = responseEventType || null;
		},

		getChannel: function() {
			return this._channel;
		},

		getRoomCommand: function() {
			return this._roomCommand;
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
		return;
	});

	return SocketSubscriptionEndpoint;
}();