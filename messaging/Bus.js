var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

var Publisher = require('./publishers/Publisher');
var Router = require('./routers/Router');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/Bus');

	var Bus = Disposable.extend({
		init: function(publisher, router) {
			assert.argumentIsRequired(publisher, 'publisher', Publisher, 'Publisher');
			assert.argumentIsRequired(router, 'router', Router, 'Router');

			this._publisher = publisher;
			this._router = router;

			this._startPromise = null;
			this._started = false;
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			if (that._startPromise === null) {
				that._startPromise = when.join(that._publisher.start(), that._router.start())
					.then(function(ignored) {
						that._started = true;

						return that._started;
					});
			}

			return that._startPromise;
		},

		publish: function(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			var that = this;

			if (!that._started) {
				throw new Error('The bus has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return that._publisher.publish(messageType, payload);
		},

		subscribe: function(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			var that = this;

			if (!that._started) {
				throw new Error('The bus has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return that._publisher.subscribe(messageType, handler);
		},

		request: function(messageType, payload, timeout) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);
			assert.argumentIsOptional(timeout, 'timeout', Number);

			var that = this;

			if (!that._started) {
				throw new Error('The bus has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			var start = new Date();

			var requestPromise;

			if (that._router.canRoute(messageType)) {
				requestPromise = that._router.route(messageType, payload);

				var timeoutToUse;

				if (_.isNumber(timeout)) {
					timeoutToUse = Math.max(0, timeout);
				} else {
					timeoutToUse = DEFAULT_TIMEOUT_MILLISECONDS;
				}

				if (timeoutToUse > 0) {
					requestPromise = requestPromise.timeout(timeoutToUse)
						.catch(function(e) {
							logger.warn('Request [', messageType, '] timed out after', timeoutToUse, 'milliseconds');

							throw e;
						}).finally(function(e) {
							var end = new Date();

							logger.debug('Request [', messageType, '] completed after', (end.getDate() - start.getDate()), 'milliseconds');
						});
				}
			} else {
				requestPromise = when.reject('Existing routers are unable to handle request.');
			}

			return requestPromise;
		},

		register: function(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			var that = this;

			if (!that._started) {
				throw new Error('The bus has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return that._router.register(messageType, handler);
		},

		_onDispose: function() {
			this._publisher.dispose();
			this._router.dispose();

			this._publisher = null;
			this._router = null;
		},

		toString: function() {
			return '[Bus]';
		}
	});

	var DEFAULT_TIMEOUT_MILLISECONDS = 20000;

	return Bus;
}();