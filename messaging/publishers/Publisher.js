var log4js = require('log4js');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/publishers/Publisher');

	class Publisher extends Disposable {
		constructor() {
			super();

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

			return Promise.resolve()
				.then(() => {
					return this._publish(messageType, payload);
				});
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

			return Promise.resolve()
				.then(() => {
					return this._subscribe(messageType, handler);
				});
		}

		_subscribe(messageType, handler) {
			return Disposable.fromAction(() => {
				return;
			});
		}

		_onDispose() {
			return;
		}

		toString() {
			return '[Publisher]';
		}
	}

	return Publisher;
})();