var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');
var is = require('common/lang/is');

var Publisher = require('./publishers/Publisher');
var Router = require('./routers/Router');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/Bus');

	const DEFAULT_TIMEOUT_MILLISECONDS = 20000;

	class Bus extends Disposable {
		constructor(publisher, router) {
			super();

			assert.argumentIsRequired(publisher, 'publisher', Publisher, 'Publisher');
			assert.argumentIsRequired(router, 'router', Router, 'Router');

			this._publisher = publisher;
			this._router = router;

			this._startPromise = null;
			this._started = false;
		}

		start() {
			if (this.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.all([ this._publisher.start(), this._router.start() ])
					.then((ignored) => {
						this._started = true;

						return this._started;
					});
			}

			return this._startPromise;
		}

		publish(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			if (!this._started) {
				throw new Error('The bus has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return this._publisher.publish(messageType, payload);
		}

		subscribe(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			if (!this._started) {
				throw new Error('The bus has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return this._publisher.subscribe(messageType, handler);
		}

		request(messageType, payload, timeout) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);
			assert.argumentIsOptional(timeout, 'timeout', Number);

			if (!this._started) {
				throw new Error('The bus has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			let requestPromise;

			if (this._router.canRoute(messageType)) {
				requestPromise = this._router.route(messageType, payload);

				let timeoutToUse;

				if (is.number(timeout)) {
					timeoutToUse = Math.max(0, timeout);
				} else {
					timeoutToUse = DEFAULT_TIMEOUT_MILLISECONDS;
				}

				if (timeoutToUse > 0) {
					requestPromise = requestPromise.timeout(timeoutToUse);
				}
			} else {
				requestPromise = Promise.reject('Existing routers are unable to handle request.');
			}

			return requestPromise;
		}

		register(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			if (!this._started) {
				throw new Error('The bus has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return this._router.register(messageType, handler);
		}

		_onDispose() {
			this._publisher.dispose();
			this._router.dispose();

			this._publisher = null;
			this._router = null;
		}

		toString() {
			return '[Bus]';
		}
	}

	return Bus;
})();