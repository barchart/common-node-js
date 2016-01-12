var _ = require('lodash');
var log4js = require('log4js');

var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

var Publisher = require('./Publisher');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/publishers/LocalPublisher');

	var LocalPublisher = Publisher.extend({
		init: function() {
			this._super();

			this._subscriptions = { };
		},

		_publish: function(messageType, payload) {
			var that = this;

			if (_.has(this._subscriptions, messageType)) {
				this._subscriptions[messageType].fire(payload);
			}
		},

		_subscribe: function(messageType, handler) {
			if (!_.has(this._subscriptions, messageType)) {
				this._subscriptions[messageType] = new Event(this);
			}

			return this._subscriptions[messageType].register(getEventHandlerForSubscription(handler));
		},

		_onDispose: function() {
			_.forEach(this._subscriptions, function(event) {
				event.dispose();
			});

			this._subscriptions = null;
		},

		toString: function() {
			return '[LocalPublisher]';
		}
	});

	function getEventHandlerForSubscription(handler) {
		return function(data, ignored) {
			handler(data);
		};
	}

	return LocalPublisher;
}();