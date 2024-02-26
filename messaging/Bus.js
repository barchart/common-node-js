const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	is = require('@barchart/common-js/lang/is'),
	promise = require('@barchart/common-js/lang/promise');

const Publisher = require('./publishers/Publisher'),
	Router = require('./routers/Router');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/Bus');

	const DEFAULT_TIMEOUT_MILLISECONDS = 20000;

	/**
	 * A central mechanism for publish-subscribe and request-response processing.
	 *
	 * @public
	 * @extends {Disposable}
	 * @param {Publisher} publisher
	 * @param {Router} router
	 */
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

		/**
		 * Initializes the instance. Invoke before using other instance functions.
		 *
		 * @public
		 * @async
		 * @returns {Promise<boolean>}
		 */
		async start() {
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

		/**
		 * Publishes a message.
		 *
		 * @public
		 * @async
		 * @param {String} messageType
		 * @param {*} payload
		 * @returns {Promise}
		 */
		async publish(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);

			if (!this._started) {
				throw new Error('The bus has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return this._publisher.publish(messageType, payload);
		}

		/**
		 * Subscribes to messages by type and returns a {@link Disposable} that
		 * can be used to terminate the subscription.
		 *
		 * @public
		 * @async
		 * @param {String} messageType
		 * @param {Function} handler
		 * @returns {Promise<Disposable>}
		 */
		async subscribe(messageType, handler) {
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

		/**
		 * Sends a request (where the response is returned as a promise).
		 *
		 * @public
		 * @async
		 * @param {String} messageType
		 * @param {*} payload
		 * @param {Number=} timeout
		 * @returns {Promise<*>}
		 */
		async request(messageType, payload, timeout) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsOptional(timeout, 'timeout', Number);

			if (!this._started) {
				throw new Error('The bus has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			const start = new Date();

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
					requestPromise = promise.timeout(requestPromise, timeoutToUse)
						.then((response) => {
							const end = new Date();

							logger.debug('Request [', messageType, '] completed after', (end.getTime() - start.getTime()), 'milliseconds');

							return response;
						}).catch((e) => {
							const end = new Date();

							logger.warn('Request [', messageType, '] failed after', (end.getTime() - start.getTime()), 'milliseconds');

							throw e;
						});
				}
			} else {
				requestPromise = Promise.reject(`Existing routers are unable to handle request (${messageType}).`);
			}

			return requestPromise;
		}

		/**
		 * Registers a handler for requests (of a certain type) and returns
		 * a {@link Disposable} that can be used to unregister the handler.
		 *
		 * @public
		 * @async
		 * @param {String} messageType
		 * @param {Function} handler
		 * @returns {Promise<Disposable>}
		 */
		async register(messageType, handler) {
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
