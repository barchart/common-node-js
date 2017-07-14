const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable'),
	is = require('common/lang/is'),
	object = require('common/lang/object'),
	promise = require('common/lang/promise');

const TableBuilder = require('./dynamo/TableBuilder');

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
		 * @returns {Object}
		 */
		getConfiguration() {
			if (this.getIsDisposed()) {
				throw new Error('The Dynamo Provider has been disposed.');
			}

			return object.clone(this._configuration);
		}

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
									const matches = data.TableNames.filter((name) => name.startsWith(this._configuration.prefix));

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

		createTable(tableBuilder) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(tableBuilder, 'tableBuilder', TableBuilder, 'TableBuilder');

					checkReady.call(this);

					return promise.build((resolveCallback, rejectCallback) => {
						this._dynamo.createTable(tableBuilder.toTableSchema(), (error, data) => {
							if (error) {
								logger.error(error);

								rejectCallback('Failed to retrieve DynamoDB tables', error);
							} else {
								resolveCallback();
							}
						});
					});
				});
		}

		getTableBuilder(name) {
			assert.argumentIsRequired(name, 'name', String);

			return TableBuilder.withName(`{this._configuration.prefix}-${name}`);
		}

		_onDispose() {
			logger.debug('Dynamo Provider disposed');
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

	class Key {
		constructor(name, dataType, keyType) {
			assert.argumentIsRequired(name, 'name', String);
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');
			assert.argumentIsRequired(keyType, 'keyType', KeyType, 'KeyType');

			this._name = name;
			this._dataType = dataType;
			this._keyType = keyType;
		}

		get name() {
			return this._name;
		}

		get dataType() {
			return this._dataType;
		}

		get keyType() {
			return this._keyType;
		}

		toString() {
			return `[Key (name=${this._name})]`;
		}
	}

	return DynamoProvider;
})();