const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Event = require('@barchart/common-js/messaging/Event'),
	Disposable = require('@barchart/common-js/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/routers/Router');

	class Router extends Disposable {
		constructor(suppressExpressions) {
			super();

			this._suppressExpressions = suppressExpressions || [ ];

			this._startPromise = null;
			this._started = false;
		}

		start() {
			if (this.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						return this._start();
					}).then(() => {
						this._started = true;

						return this._started;
					});
			}

			return this._startPromise;
		}

		_start() {
			return;
		}

		canRoute(messageType) {
			assert.argumentIsRequired(messageType, 'messageType', String);

			if (!this._started) {
				throw new Error('The router has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message router has been disposed');
			}

			return !checkSuppression(messageType, this._suppressExpressions) && this._canRoute(messageType);
		}

		_canRoute(messageType) {
			return false;
		}

		route(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);

			if (!this._started) {
				throw new Error('The router has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message router has been disposed');
			}

			if (!this.canRoute(messageType)) {
				throw new Error('The message router does not support the message type.');
			}

			return Promise.resolve()
				.then(() => {
					return this._route(messageType, payload);
				});
		}

		_route(messageType, payload) {
			return;
		}

		register(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			if (!this._started) {
				throw new Error('The router has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message router has been disposed');
			}

			let registerPromise;

			if (checkSuppression(messageType, this._suppressExpressions)) {
				logger.debug('Suppressing registration for to', messageType);

				registerPromise = Promise.resolve(Disposable.getEmpty());
			} else {
				registerPromise = Promise.resolve()
					.then(() => {
						return this._register(messageType, handler);
					});
			}

			return registerPromise;
		}

		_register(messageType, handler) {
			return Disposable.getEmpty();
		}

		_onDispose() {
			return;
		}

		toString() {
			return '[Router]';
		}
	}

	function checkSuppression(messageType, suppressExpressions) {
		return suppressExpressions.length !== 0 && suppressExpressions.some((suppressExpression) => {
			return suppressExpression.test(messageType);
		});
	}

	return Router;
})();
