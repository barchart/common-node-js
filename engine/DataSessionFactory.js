const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert');

const FailureReason = require('@barchart/common-js/api/failures/FailureReason');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('portfolio-common/engine/DataSessionFactory');

	/**
	 * A factory for creating {@link DataSession} instances.
	 *
	 * @public
	 */
	class DataSessionFactory {
		constructor() {
			this._started = false;
			this._startPromise = null;
		}

		start() {
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

		/**
		 * Returns a new {@link DataSession} to the callback and processes
		 * it synchronously. The result of the session is returned via a
		 * promise.
		 *
		 * @public
		 * @param {DataSessionFactory~dataSessionCallback} callback - Provides the {@link DataSession}
		 * @param {Object=} options
		 * @returns {Promise}
		 */
		startSession(callback, options) {
			return Promise.resolve()
				.then(() => {
					if (!this._started) {
						throw new Error('Unable to create session, the data session factory must be started.');
					}

					assert.argumentIsRequired(callback, 'callback', Function);

					return this._getSession();
				}).catch((e) => {
					logger.error('Session creation failed', e);

					return null;
				}).then((pendingSession) => {
					let completedSession;

					try {
						callback(pendingSession);

						completedSession = pendingSession;
					} catch(e) {
						logger.error('Session construction failed', e);

						completedSession = null;
					}

					return completedSession;
				}).then((session) => {
					let flushPromise;

					if (session) {
						flushPromise = this.getDataProvider(options)
							.then((dataProvider) => {
								return session.flush(dataProvider);
							});
					} else {
						flushPromise = Promise.resolve();
					}

					return flushPromise;
				}).catch((e) => {
					if (e instanceof FailureReason) {
						try {
							logger.error('Session flush failed', e.format());
						} catch (ignored) {

						}
					} else {
						logger.error('Session flush failed', e);
					}

					return Promise.reject(e);
				});
		}

		/**
		 * Overridden in inheriting classes, allowing customization of the
		 * {@link DataSession} generated.
		 *
		 * @protected
		 * @returns {Promise<DataSession>|DataSession}
		 */
		_getSession() {
			return null;
		}

		/**
		 * Returns a {@link DataProvider} for use by a {@link DataSession}.
		 *
		 * @protected
		 * @param options
		 * @return {Promise}
		 */
		getDataProvider(options) {
			return Promise.resolve()
				.then(() => {
					if (!this._started) {
						throw new Error('Unable to create session, the data session factory must be started.');
					}

					return this._getDataProvider(options);
				});
		}

		/**
		 * Overridden in inheriting classes, allowing customization of the
		 * {@link DataProvider} used when flushing a {@link DataSession}.
		 *
		 * @protected
		 * @returns {Promise<DataProvider>|DataProvider}
		 */
		_getDataProvider(options) {
			return null;
		}

		toString() {
			return '[DataSessionFactory]';
		}
	}

	/**
	 * A callback used to return a {@link DataSession}.
	 *
	 * @public
	 * @callback DataSessionFactory~dataSessionCallback
	 * @param {DataSession} dataSession
	 */

	return DataSessionFactory;
})();
