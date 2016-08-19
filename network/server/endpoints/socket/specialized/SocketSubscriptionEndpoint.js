var CommandHandler = require('common/commands/CommandHandler');
var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');

var Endpoint = require('./../../Endpoint');

module.exports = function() {
	'use strict';

	const emptyCommand = CommandHandler.fromFunction(() => {
		return null;
	});

	class SocketSubscriptionEndpoint extends Endpoint {
		constructor(channel, roomCommand, responseCommand, responseEventType) {
			super(emptyCommand);

			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(roomCommand, 'roomCommand', CommandHandler, 'CommandHandler');
			assert.argumentIsOptional(responseCommand, 'responseCommand', CommandHandler, 'CommandHandler');
			assert.argumentIsOptional(responseEventType, 'responseEventType', String);

			this._channel = channel;
			this._roomCommand = roomCommand;

			this._responseCommand = responseCommand || emptyCommand;
			this._responseEventType = responseEventType || '';
		}

		getChannel() {
			return this._channel;
		}

		getRoomCommand() {
			return this._roomCommand;
		}

		getResponseCommand() {
			return this._responseCommand;
		}

		getResponseEventType() {
			return this._responseEventType;
		}

		toString() {
			return '[SocketSubscriptionEndpoint]';
		}
	}

	return SocketSubscriptionEndpoint;
}();