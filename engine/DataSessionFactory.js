const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

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
		 * @returns {Promise}
		 */
		startSession(callback) {
			return Promise.resolve()
				.then(() => {
					if (!this._started) {
						throw new Error('Unable to create session, the data provider factory must be started.');
					}

					assert.argumentIsRequired(callback, 'callback', Function);
					assert.argumentIsOptional(name, 'name', String);

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
						flushPromise = this.getDataProvider()
							.then((dataProvider) => {
								return session.flush(dataProvider);
							});
					} else {
						flushPromise = Promise.resolve();
					}

					return flushPromise;
				}).catch((e) => {
					logger.error('Session flush failed', e);

					if (e instanceof FailureReason) {
						try {
							logger.error('Session flush failure reason', e.format());
						} catch (ignored) {

						}
					}

					return Promise.reject(e);
				});
		}

		/**
		 * @protected
		 * @returns {Promise.<DataSession>|DataSession}
		 */
		_getSession() {
			return null;
		}

		getDataProvider() {
			return Promise.resolve()
				.then(() => {
					if (!this._started) {
						throw new Error('Unable to create session, the data provider factory must be started.');
					}

					return this._getDataProvider();
				});
		}

		_getDataProvider() {
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
