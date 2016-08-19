var log4js = require('log4js');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/routers/Router');

	class Router extends Disposable {
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

		canRoute(messageType) {
			assert.argumentIsRequired(messageType, 'messageType', String);

			if (!this._started) {
				throw new Error('The router has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message router has been disposed');
			}

			return this._canRoute(messageType);
		}

		_canRoute(messageType) {
			return false;
		}

		route(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);

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

			return Promise.resolve()
				.then(() => {
					return this._register(messageType, handler);
				});
		}

		_register(messageType, handler) {
			return Disposable.fromAction(() => {
				return;
			});
		}

		_onDispose() {
			return;
		}

		toString() {
			return '[Router]';
		}
	}

	return Router;
})();