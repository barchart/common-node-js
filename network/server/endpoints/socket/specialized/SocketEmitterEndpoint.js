var CommandHandler = require('common/commands/CommandHandler');
var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');

var Endpoint = require('./../../Endpoint');

module.exports = (() => {
	'use strict';

	const emptyCommand = CommandHandler.fromFunction(() => {
		return;
	});

	class SocketEmitterEndpoint extends Endpoint {
		constructor(channel, event, eventType, roomQualifier) {
			super(emptyCommand);

			assert.argumentIsRequired(channel, 'channel', String);
			assert.argumentIsRequired(event, 'event', Event, 'Event');
			assert.argumentIsRequired(eventType, 'eventType', String);
			assert.argumentIsOptional(roomQualifier, 'roomQualifier', Function);

			this._channel = channel;
			this._event = event;
			this._eventType = eventType || null;
			this._roomQualifier = roomQualifier || getBroadcastRoom;
		}

		getChannel() {
			return this._channel;
		}

		getEvent() {
			return this._event;
		}

		getEventType() {
			return this._eventType;
		}

		getRoomQualifier() {
			return this._roomQualifier;
		}

		toString() {
			return '[SocketEmitterEndpoint]';
		}
	}

	function getBroadcastRoom(ignored) {
		return null;
	}

	return SocketEmitterEndpoint;
})();