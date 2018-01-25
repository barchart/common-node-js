const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	is = require('@barchart/common-js/lang/is'),
	promise = require('@barchart/common-js/lang/promise');

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
	 * @interface
	 * @extends {Disposable}
	 * @param {Table} definition
	 * @param {DynamoProvider} provider
	 */
	class TableContainer extends Disposable {
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
		 * The table definition.
		 *
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
		 * @param {Boolean=} skipVerification - If true, verification of table's existence and schema is skipped. This could be considered unsafe, but startup will be faster.
		 * @returns {Promise.<Boolean>}
		 */
		start(skipVerification) {
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						if (this.getIsDisposed()) {
							return Promise.reject('The Dynamo Provider has been disposed.');
						}

						assert.argumentIsOptional(skipVerification, 'skipVerification', Boolean);

						return this._provider.start();
					}).then(() => {
						let createPromise;

						if (is.boolean(skipVerification) && skipVerification) {
							createPromise = Promise.resolve();
						} else {
							createPromise = this._provider.createTable(this.definition);
						}
						return createPromise;
					}).then(() => {
						logger.info('Dynamo table wrapper for', this._definition.name, 'initialized');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('Dynamo table wrapper failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		/**
		 * Returns true, if the item conforms to the table's schema; otherwise false.
		 *
		 * @protected
		 * @abstract
		 * @param {Object} item
		 * @returns {boolean}
		 */
		_validate(item) {
			return is.object(item);
		}

		/**
		 * Creates a new item.
		 *
		 * @protected
		 * @param {Object} item
		 * @param {Boolean} preventOverwrite
		 * @returns {Promise}
		 */
		_createItem(item, preventOverwrite) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					if (!this._validate(item)) {
						logger.trace('Failed to create item in [', this.definition.name, '] table', item);

						throw new Error(`Unable to insert item in [${this.definition.name}] table`);
					}

					return this._provider.saveItem(item, this.definition, preventOverwrite);
				});
		}

		/**
		 * Creates an array of new items.
		 *
		 * @protected
		 * @param {Object} items
		 * @returns {Promise}
		 */
		_createItems(items) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					items.forEach((item) => {
						if (!this._validate(item)) {
							logger.trace('Failed to create item in [', this.definition.name, '] table', item);

							throw new Error(`Unable to insert item in [${this.definition.name}] table`);
						}
					});

					return this._provider.createItems(items, this.definition);
				});
		}

		/**
		 * Runs a scan on the table.
		 *
		 * @public
		 * @param {Scan} scan
		 * @returns {Promise.<Array<Object>>}
		 */
		scan(scan) {
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
		 * @param {Query} query
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
			return;
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