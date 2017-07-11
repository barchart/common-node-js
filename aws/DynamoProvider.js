const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable'),
	is = require('common/lang/is'),
	object = require('common/lang/object'),
	promise = require('common/lang/promise');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/DynamoProvider');

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
				throw new Error('The Dynamo Provider has been disposed.');
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
			if (this.getIsDisposed()) {
				throw new Error('The Dynamo Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The Dynamo Provider has not been started.');
			}

			const getTablesRecursive = (previous) => {
				return promise.build((resolveCallback, rejectCallback) => {
					const options = { };

					if (previous && is.string(previous)) {
						options.ExclusiveStartTableName = previous;
					}

					this._dynamo.listTables(options, (error, data) => {
						if (error !== null) {
							logger.info('Retrieved', data.TableNames.length, 'DynamoDB tables.');

							if (is.string(data.LastEvaluatedTableName)) {
								getTablesRecursive(data.LastEvaluatedTableName)
									.then((tableNames) => {
										resolveCallback(data.TableNames.concat(tableNames));
									});
							} else {
								resolveCallback(data.TableNames);
							}
						} else {
							logger.error(error);

							rejectCallback('Failed to retrieve DynamoDB tables', error);
						}
					});
				});
			};

			return getTablesRecursive();
		}

		_onDispose() {
			logger.debug('Dynamo Provider disposed');
		}

		toString() {
			return '[DynamoProvider]';
		}
	}

	return DynamoProvider;
})();