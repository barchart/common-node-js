var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/publishers/Publisher');

	var Publisher = Disposable.extend({
		init: function(publishPredicate, subscribePredicate) {
			this._super();

			assert.argumentIsOptional(publishPredicate, 'publishPredicate', Function);
			assert.argumentIsOptional(subscribePredicate, 'subscribePredicate', Function);

			if (_.isFunction(publishPredicate)) {
				this._publishPredicate = publishPredicate;
			} else {
				this._publishPredicate = function(ignored) {
					return true;
				};
			}

			if (_.isFunction(subscribePredicate)) {
				this._subscribePredicate = subscribePredicate;
			} else {
				this._subscribePredicate = function(ignored) {
					return true;
				};
			}

			this._startPromise = null;
			this._started = false;
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			if (that._startPromise === null) {
				that._startPromise = when.try(function() {
					return that._start();
				}).then(function() {
					that._started = true;

					return that._started;
				});
			}

			return that._startPromise;
		},

		_start: function() {
			return;
		},

		publish: function(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			var that = this;

			if (!that._started) {
				throw new Error('The publisher has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			return when.try(function() {
				var publishPromise;

				if (this._publishPredicate(messageType, payload)) {
					publishPromise = that._publish(messageType, payload);
				} else {
					publishPromise = when(false);
				}

				return publishPromise;
			});
		},

		_publish: function(messageType, payload) {
			return;
		},

		subscribe: function(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			var that = this;

			if (!that._started) {
				throw new Error('The publisher has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			return when.try(function() {
				var subscription;

				if (this._subscribePredicate(messageType)) {
					subscription = that._subscribe(messageType, handler);
				} else {
					subscription = Disposable.fromAction(function() {
						return;
					});
				}

				return subscription;
			});
		},

		_subscribe: function(messageType, handler) {
			return Disposable.fromAction(function() {
				return;
			});
		},

		_onDispose: function() {
			return;
		},

		toString: function() {
			return '[Publisher]';
		}
	});

	return Publisher;
}();