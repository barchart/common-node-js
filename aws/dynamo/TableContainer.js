const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable'),
	is = require('common/lang/is'),
	promise = require('common/lang/promise');

const Definition = require('./schema/definitions/Table'),
	DynamoProvider = require('./../DynamoProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/TableContainer');

	/**
	 * A container that houses functions for implementing with a
	 * single DynamoDB table. In other words, this is the base
	 * class for a DynamoDB based repository pattern.
	 *
	 * @abstract
	 */
	class TableContainer extends Disposable {
		/**
		 * @param {Table} definition
		 * @param {DynamoProvider} provider
		 */
		constructor(provider, definition) {
			super();

			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');
			assert.argumentIsRequired(definition, 'definition', Definition, 'Definition');

			this._provider = provider;
			this._definition = definition;

			this._startPromise = null;
			this._started = false;
		}

		/**
		 * @public
		 * @returns {Table}
		 */
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

		/**
		 * Runs a scan on the table.
		 *
		 * @protected
		 * @ignore
		 * @param {Scan} scan
		 * @returns {Promise.<Array<Object>>}
		 */
		_scan(scan) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					return this._provider.scan(scan);
				});
		}

		/**
		 * Runs a query on the table.
		 *
		 * @protected
		 * @ignore
		 * @param {Scan} scan
		 * @returns {Promise.<Array<Object>>}
		 */
		query(query) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					return this._provider.query(query);
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

	return TableContainer;
})();