const CommandHandler = require('@barchart/common-js/commands/CommandHandler'),
	assert = require('@barchart/common-js/lang/assert'),
	Event = require('@barchart/common-js/messaging/Event');

const Endpoint = require('./../../Endpoint');

module.exports = (() => {
	'use strict';

	const emptyCommand = CommandHandler.fromFunction(() => null);

	class SocketSubscriptionEndpoint extends Endpoint {
		constructor(channel, roomsCommand, responseCommand, responseEventType) {
			super(emptyCommand);

			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(roomsCommand, 'roomsCommand', CommandHandler, 'CommandHandler');
			assert.argumentIsOptional(responseCommand, 'responseCommand', CommandHandler, 'CommandHandler');
			assert.argumentIsOptional(responseEventType, 'responseEventType', String);

			this._channel = channel;
			this._roomsCommand = roomsCommand;

			this._responseCommand = responseCommand || emptyCommand;
			this._responseEventType = responseEventType || '';
		}

		getChannel() {
			return this._channel;
		}

		getRoomsCommand() {
			return this._roomsCommand;
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
})();