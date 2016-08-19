var log4js = require('log4js');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/publishers/Publisher');

	class Publisher extends Disposable {
		constructor(suppressExpressions) {
			super();

			assert.argumentIsOptional(suppressExpressions, 'suppressExpressions', Array);

			if (suppressExpressions) {
				assert.argumentIsArray(suppressExpressions, 'suppressExpressions', RegExp, 'RegExp');
			}

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

		publish(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			if (!this._started) {
				throw new Error('The publisher has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			let publishPromise;

			if (checkSuppression(messageType, this._suppressExpressions)) {
				logger.trace('Suppressing publish for', messageType);

				publishPromise = Promise.resolve(Disposable.getEmpty());
			} else {
				publishPromise = Promise.resolve()
					.then(() => {
						return this._publish(messageType, payload);
					});
			}

			return publishPromise;
		}

		_publish(messageType, payload) {
			return;
		}

		subscribe(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			if (!this._started) {
				throw new Error('The publisher has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			let subscribePromise;

			if (checkSuppression(messageType, this._suppressExpressions)) {
				logger.debug('Suppressing subscription to', messageType);

				subscribePromise = Promise.resolve(Disposable.getEmpty());
			} else {
				subscribePromise = Promise.resolve()
					.then(() => {
						return this._subscribe(messageType, handler);
					});
			}

			return subscribePromise;
		}

		_subscribe(messageType, handler) {
			return Disposable.getEmpty();
		}

		_onDispose() {
			return;
		}

		toString() {
			return '[Publisher]';
		}
	}

	function checkSuppression(messageType, suppressExpressions) {
		return suppressExpressions.length !== 0 && _.some(suppressExpressions, function(suppressExpression) {
			return suppressExpression.test(messageType);
		});
	}

	return Publisher;
})();
