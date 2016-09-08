var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var DisposableStack = require('common/collections/specialized/DisposableStack');

var Publisher = require('./Publisher');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/publishers/CompositePublisher');

	var CompositePublisher = Publisher.extend({
		init: function(publishers, suppressExpressions) {
			assert.argumentIsArray(publishers, 'publishers', Publisher, 'Publisher');

			this._super(suppressExpressions);

			this._publishers = publishers;
		},

		_start: function() {
			var that = this;

			return when.map(that._publishers, function(publisher) {
				return publisher.start();
			}).then(function() {
				return true;
			});
		},

		_publish: function(messageType, payload) {
			var that = this;

			var publishPromises = _.map(that._publishers, function(publisher) {
				return publisher.publish(messageType, payload);
			});

			return when.all(publishPromises)
				.then(function(ignored) {
					return;
				});
		},

		_subscribe: function(messageType, handler) {
			var that = this;

			var subscribePromises = _.map(that._publishers, function(publisher) {
				return publisher.subscribe(messageType, handler);
			});

			return when.all(subscribePromises)
				.then(function(subscriptions) {
					var disposableStack = new DisposableStack();

					for (var i = 0; i < subscriptions.length; i++) {
						disposableStack.push(subscriptions[i]);
					}

					return disposableStack;
				});
		},

		_onDispose: function() {
			_.forEach(this._publishers, function(publisher) {
				publisher.dispose();
			});

			this._publishers = null;

			logger.debug('Composite publisher disposed');
		},

		toString: function() {
			return '[CompositePublisher]';
		}
	});

	return CompositePublisher;
}();