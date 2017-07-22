const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable'),
	is = require('common/lang/is'),
	promise = require('common/lang/promise');

const Definition = require('./dynamo/schema/definitions/Table'),
	DynamoProvider = require('./../DynamoProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/Table');

	class Table extends Disposable {
		constructor(definition, provider) {
			super();

			assert.argumentIsRequired(definition, 'definition', Definition, 'Definition');
			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');

			this._definition = definition;
			this._provider = provider;

			this._startPromise = null;
			this._started = false;
		}

		get definition() {
			return this._definition;
		}

		/**
		 * Initializes the table. Call this before invoking any other instance
		 * functions.
		 *
		 * @public
		 * @returns {Promise.<Boolean>}
		 */
		start() {
			if (this.getIsDisposed()) {
				return Promise.reject('The Dynamo Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						return this._provider.start();
					}).then(() => {
						logger.info('Dynamo table wrapper for ', this._definition.name,'initialized');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('Dynamo Provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		scan(scan) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

				});
		}

		query(query) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

				});
		}

		_onDispose() {

		}

		toString() {
			return '[Table]';
		}
	}

	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The Table has been disposed.');
		}

		if (!this._started) {
			throw new Error('The Table has not been started.');
		}
	}

	return Table;
})();