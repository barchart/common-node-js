const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable'),
	is = require('common/lang/is'),
	object = require('common/lang/object'),
	promise = require('common/lang/promise'),
	Scheduler = require('common/timing/Scheduler');

const Table = require('./dynamo/schema/definitions/Table'),
	TableBuilder = require('./dynamo/schema/builders/TableBuilder');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/DynamoProvider');

	/**
	 * A facade for Amazon's DynamoDB service. The constructor accepts
	 * configuration options. The promise-based instance functions
	 * abstract knowledge of the AWS API.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.region - The AWS region (e.g. "us-east-1").
	 * @param {string} configuration.prefix - The prefix to automatically append to table names.
	 * @param {string=} configuration.apiVersion - The DynamoDB API version (defaults to "2012-08-10").
	 */
	class DynamoProvider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsRequired(configuration.prefix, 'configuration.prefix', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._dynamo = null;
			this._scheduler = null;
		}

		/**
		 * Initializes the Amazon SDK. Call this before invoking any other instance
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
						this._scheduler = new Scheduler();
					}).then(() => {
						aws.config.update({region: this._configuration.region});

						this._dynamo = new aws.DynamoDB({apiVersion: this._configuration.apiVersion || '2012-08-10'});
					}).then(() => {
						logger.info('Dynamo Provider started');

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
		 * Returns a clone of the configuration object originally passed
		 * to the constructor.
		 *
		 * @public
		 * @returns {Object}
		 */
		getConfiguration() {
			if (this.getIsDisposed()) {
				throw new Error('The Dynamo Provider has been disposed.');
			}

			return object.clone(this._configuration);
		}

		/**
		 * Gets the definition of a table. If no matching table exists; then
		 * the promise is rejected.
		 *
		 * @public
		 * @returns {Promise.<Table>}
		 */
		getTable(name) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					return getTable.call(this, getQualifiedTableName(this._configuration.prefix, name))
						.then((tableDefinition) => {
							return TableBuilder.fromDefinition(tableDefinition);
						});
				});
		}

		/**
		 * Gets a list of all tables.
		 *
		 * @public
		 * @returns {Promise.<string>}
		 */
		getTables() {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					const getTablesRecursive = (previous) => {
						return promise.build((resolveCallback, rejectCallback) => {
							const options = { };

							if (previous && is.string(previous)) {
								options.ExclusiveStartTableName = previous;
							}

							this._dynamo.listTables(options, (error, data) => {
								if (error) {
									logger.error(error);

									rejectCallback('Failed to retrieve DynamoDB tables', error);
								} else {
									const matches = data.TableNames.filter(name => name.startsWith(this._configuration.prefix));

									logger.info('Retrieved', matches.length, 'matching DynamoDB tables.');

									if (is.string(data.LastEvaluatedTableName)) {
										getTablesRecursive(data.LastEvaluatedTableName)
											.then((more) => {
												resolveCallback(matches.concat(more));
											});
									} else {
										resolveCallback(matches);
									}
								}
							});
						});
					};

					return getTablesRecursive();
				});
		}

		/**
		 * Creates a new table, if it does not already exist, and returns the table's
		 * metadata once the table becomes ready.
		 *
		 * @public
		 * @param {Table} definition - Describes the schema of the table to create.
		 * @returns {Promise.<Table>}
		 */
		createTable(definition) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(definition, 'definition', Table, 'Table');

					checkReady.call(this);

					const qualifiedTableName = definition.name;

					const getTableForCreate = () => {
						return getTable.call(this, qualifiedTableName)
							.then((tableDefinition) => {
								if (tableDefinition.TableStatus === 'ACTIVE') {
									logger.debug('Table ready [', qualifiedTableName, ']');

									return tableDefinition;
								} else {
									logger.debug('Table not yet ready [', qualifiedTableName, ']');

									return null;
								}
							});
					};

					return promise.build((resolveCallback, rejectCallback) => {
						logger.debug('Creating table [', qualifiedTableName, ']');

						this._dynamo.createTable(definition.toTableSchema(), (error, data) => {
							if (error) {
								if (is.string(error.message) && error.message === `Table already exists: ${qualifiedTableName}`) {
									logger.debug('Unable to create table [', qualifiedTableName, '], table already exists');

									getTableForCreate.call(this, qualifiedTableName)
										.then((tableDefinition) => {
											resolveCallback(TableBuilder.fromDefinition(tableDefinition));
										}).catch((e) => {
										rejectCallback(e);
									});
								} else {
									logger.error(error);

									rejectCallback('Failed to create DynamoDB tables', error);
								}
							} else {
								logger.debug('Created table [', qualifiedTableName, '], waiting for table to become ready');

								return this._scheduler.backoff(() => getTableForCreate.call(this, qualifiedTableName), 2000)
									.then((tableDefinition) => {
										resolveCallback(TableBuilder.fromDefinition(tableDefinition));
									}).catch((e) => {
										rejectCallback(e);
									});
							}
						});
					});
				});
		}

		/**
		 * Adds a new item to a table.
		 *
		 * @public
		 * @param {Table} definition - Describes the schema of the table to create.
		 * @param {Object} item - The item to write.
		 * @returns {Promise}
		 */
		createItem(table, item) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(table, 'table', Table, 'Table');
					assert.argumentIsRequired(item, 'item', Object);

					checkReady.call(this);

					const qualifiedTableName = table.name;

					return promise.build((resolveCallback, rejectCallback) => {

					});
				});
		}

		/**
		 * Adds a new item to a table; or overwrites the item if it already exists.
		 *
		 * @public
		 * @param {Table} definition - Describes the schema of the table to create.
		 * @param {Object} item - The item to write.
		 * @returns {Promise}
		 */
		saveItem(table, item) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(table, 'table', Table, 'Table');
					assert.argumentIsRequired(item, 'item', Object);

					checkReady.call(this);

					const qualifiedTableName = table.name;

					return promise.build((resolveCallback, rejectCallback) => {

					});
				});
		}

		/**
		 * Adds multiple items to a table.
		 *
		 * @public
		 * @param {Table} definition - Describes the schema of the table to create.
		 * @param {Array<Object>} item - The items to write.
		 * @returns {Promise}
		 */
		createItems(table, items) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(table, 'table', Table, 'Table');
					assert.argumentIsArray(items, 'items');

					checkReady.call(this);

					const qualifiedTableName = table.name;

					return promise.build((resolveCallback, rejectCallback) => {

					});
				});
		}

		/**
		 * Returns a new {@link TableBuilder} instance, suitable for use by the
		 * {@link DynamoProvider#createTable} function.
		 *
		 * @public
		 * @param {string} name - The name of the table.
		 * @returns {TableBuilder}
		 */
		getTableBuilder(name) {
			assert.argumentIsRequired(name, 'name', String);

			return TableBuilder.withName(getQualifiedTableName(this._configuration.prefix, name));
		}

		_onDispose() {
			logger.debug('Dynamo Provider disposed');

			if (this._scheduler !== null) {
				this._scheduler.dispose();
				this._scheduler = null;
			}
		}

		toString() {
			return '[DynamoProvider]';
		}
	}

	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The Dynamo Provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The Dynamo Provider has not been started.');
		}
	}

	function getQualifiedTableName(prefix, name) {
		return `${prefix}-${name}`;
	}

	function getTable(qualifiedTableName) {
		return promise.build((resolveCallback, rejectCallback) => {
			this._dynamo.describeTable({ TableName: qualifiedTableName }, (error, data) => {
				if (error) {
					logger.error(error);

					rejectCallback('Failed to retrieve DynamoDB table', error);
				} else if (!is.object(data.Table)) {
					rejectCallback('Unexpected response from DynamoDB SDK.');
				} else {
					if (logger.isTraceEnabled()) {
						logger.trace(JSON.stringify(data, null, 2));
					}

					resolveCallback(data.Table);
				}
			});
		});
	}

	return DynamoProvider;
})();