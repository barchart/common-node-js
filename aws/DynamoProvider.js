const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	Enum = require('@barchart/common-js/lang/Enum'),
	is = require('@barchart/common-js/lang/is'),
	memoize = require('@barchart/common-js/lang/memoize'),
	object = require('@barchart/common-js/lang/object'),
	promise = require('@barchart/common-js/lang/promise'),
	WorkQueue = require('@barchart/common-js/timing/Serializer'),
	Scheduler = require('@barchart/common-js/timing/Scheduler');

const ConditionalBuilder = require('./dynamo/query/builders/ConditionalBuilder'),
	KeyType = require('./dynamo/schema/definitions/KeyType'),
	OperatorType = require('./dynamo/query/definitions/OperatorType'),
	Table = require('./dynamo/schema/definitions/Table'),
	TableBuilder = require('./dynamo/schema/builders/TableBuilder'),
	Query = require('./dynamo/query/definitions/Query'),
	Scan = require('./dynamo/query/definitions/Scan'),
	Serializer = require('./dynamo/schema/serialization/Serializer');

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
			this._batches = new Map();
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

					const qualifiedTableName = getQualifiedTableName(this._configuration.prefix, name);

					return getTable.call(this, qualifiedTableName)
						.then((tableData) => {
							logger.debug('Table definition retrieved for [', qualifiedTableName,']');

							return TableBuilder.fromDefinition(tableData);
						});
				});
		}

		/**
		 * Gets a list of all table names.
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
							.then((tableData) => {
								if (tableData.TableStatus === 'ACTIVE') {
									logger.info('Table ready [', qualifiedTableName, ']');

									return tableData;
								} else {
									logger.debug('Table not yet ready [', qualifiedTableName, ']');

									return null;
								}
							});
					};

					return promise.build((resolveCallback, rejectCallback) => {
						logger.info('Creating table [', qualifiedTableName, ']');

						this._dynamo.createTable(definition.toTableSchema(), (error, data) => {
							if (error) {
								if (is.string(error.message) && error.message === `Table already exists: ${qualifiedTableName}`) {
									logger.info('Unable to create table [', qualifiedTableName, '], table already exists');

									getTableForCreate.call(this, qualifiedTableName)
										.then((tableData) => {
											const serverDefinition = TableBuilder.fromDefinition(tableData);

											if (definition.equals(serverDefinition, true)) {
												resolveCallback(serverDefinition);
											} else {
												rejectCallback(new Error(`The server definition of the table [ ${qualifiedTableName} ] does not match the expected definition.`));
											}
										}).catch((e) => {
											rejectCallback(e);
										});
								} else {
									logger.error(error);

									rejectCallback('Failed to create DynamoDB tables', error);
								}
							} else {
								logger.info('Created table [', qualifiedTableName, '], waiting for table to become ready');

								return this._scheduler.backoff(() => getTableForCreate.call(this, qualifiedTableName), 2000)
									.then((tableData) => {
										resolveCallback(TableBuilder.fromDefinition(tableData));
									}).catch((e) => {
										rejectCallback(e);
									});
							}
						});
					});
				});
		}

		/**
		 * Adds a new item to a table. If the item already exists, it is overwritten.
		 *
		 * @public
		 * @param {Object} item - The item to write.
		 * @param {Table} table - Describes the schema of the table to write to.
		 * @param {Boolean=} preventOverwrite - If true, the resulting promise will reject if another item shares the same key.
		 * @returns {Promise}
		 */
		saveItem(item, table, preventOverwrite) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(table, 'table', Table, 'Table');
					assert.argumentIsRequired(item, 'item', Object);

					checkReady.call(this);

					const qualifiedTableName = table.name;

					let payload;

					if (is.boolean(preventOverwrite) && preventOverwrite) {
						const builder = new ConditionalBuilder(table)
							.withDescription(`Conditional put to [${qualifiedTableName}] table`)
							.withFilterBuilder((fb) => {
								const hashKeyName = table.keys.find(k => k.keyType === KeyType.HASH).attribute.name;

								fb.withExpression(hashKeyName, OperatorType.ATTRIBUTE_NOT_EXISTS);
							});

						payload = builder.conditional.toConditionalSchema();
					} else {
						payload = {
							TableName: table.name
						};
					}

					payload.Item = Serializer.serialize(item, table);

					const putItem = () => {
						return promise.build((resolveCallback, rejectCallback) => {
							this._dynamo.putItem(payload, (error, data) => {
								if (error) {
									const dynamoError = Enum.fromCode(DynamoError, error.code);

									if (dynamoError !== null && dynamoError.retryable) {
										logger.debug('Encountered retryable error [', error.code, '] while putting an item into [', qualifiedTableName, ']');

										rejectCallback(error);
									} else {
										resolveCallback({ code: DYNAMO_RESULT.FAILURE, error: error });
									}
								} else {
									resolveCallback({ code: DYNAMO_RESULT.SUCCESS });
								}
							});
						});
					};

					return this._scheduler.backoff(putItem)
						.then((result) => {
							if (result.code === DYNAMO_RESULT.FAILURE) {
								throw result.error;
							}

							return true;
						});
				});
		}

		/**
		 * Adds multiple items to a table. Unlike the {@link DynamoProvider#saveItem} function,
		 * batches are processed serially; that is, writes from a batch must complete before
		 * writes from a subsequent batch are started.
		 *
		 * @public
		 * @param {Array<Object>} item - The items to write.
		 * @param {Table} table - Describes the schema of the table to write to.
		 * @returns {Promise}
		 */
		createItems(items, table) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(table, 'table', Table, 'Table');
					assert.argumentIsArray(items, 'items');

					checkReady.call(this);

					if (items.length === 0) {
						return;
					}

					const qualifiedTableName = table.name;

					if (!this._batches.has(qualifiedTableName)) {
						this._batches.set(qualifiedTableName, new WorkQueue());
					}

					const workQueue = this._batches.get(qualifiedTableName);

					return workQueue.enqueue(() => {
						const batchNumber =  workQueue.getCurrent();

						logger.debug('Starting batch insert into [', qualifiedTableName, '] for batch number [', batchNumber, '] with [', items.length, '] items');

						const putBatch = (currentPayload) => {
							return promise.build((resolveCallback, rejectCallback) => {
								this._dynamo.batchWriteItem(currentPayload, (error, data) => {
									if (error) {
										const dynamoError = Enum.fromCode(DynamoError, error.code);

										if (dynamoError !== null && dynamoError.retryable) {
											logger.debug('Encountered retryable error [', error.code, '] while putting an item into [', qualifiedTableName, ']');

											rejectCallback(error);
										} else {
											resolveCallback({ code: DYNAMO_RESULT.FAILURE, error: error });
										}
									} else {
										let unprocessedItems;

										if (is.object(data.UnprocessedItems) && is.array(data.UnprocessedItems[qualifiedTableName])) {
											unprocessedItems = data.UnprocessedItems[qualifiedTableName];
										} else {
											unprocessedItems = [ ];
										}

										if (unprocessedItems.length === 0) {
											resolveCallback({ code: DYNAMO_RESULT.SUCCESS });
										} else {
											logger.debug('Continuing batch insert into [', qualifiedTableName, '] for batch number [', batchNumber,'] with [', unprocessedItems.length, '] unprocessed items');

											const continuePayload = getBatchPayload(qualifiedTableName, unprocessedItems);

											this._scheduler.backoff(() => putBatch(continuePayload))
												.then((continueResult) => {
													resolveCallback(continueResult);
												});
										}
									}
								});
							});
						};

						const originalPayload = getBatchPayload(qualifiedTableName,
							items.map((item) => {
								return {
									PutRequest: {
										Item: Serializer.serialize(item, table)
									}
								};
							})
						);

						return this._scheduler.backoff(() => putBatch(originalPayload))
							.then((result) => {
								if (result.code === DYNAMO_RESULT.FAILURE) {
									logger.error('Failed batch insert into [', qualifiedTableName, '] for batch number [', batchNumber,'] with [', items.length, '] items');

									throw result.error;
								}

								logger.debug('Finished batch insert into [', qualifiedTableName, '] for batch number [', batchNumber,'] with [', items.length, '] items');

								return true;
							});
					});
				});
		}

		/**
		 * Runs a scan against a DynamoDB table (or index) and returns
		 * all the items matching the scan.
		 *
		 * @public
		 * @param {Scan} scan
		 * @returns {Promise<Array<Object>>}
		 */
		scan(scan) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(scan, 'scan', Scan, 'Scan');

					checkReady.call(this);

					const options = scan.toScanSchema();

					const runScanRecursive = (previous) => {
						return this._scheduler.backoff(() => {
							return promise.build((resolveCallback, rejectCallback) => {
								if (previous) {
									options.ExclusiveStartKey = previous;
								}

								this._dynamo.scan(options, (error, data) => {
									if (error) {
										logger.error(error);

										rejectCallback('Failed to scan DynamoDB table', error);
									} else {
										const results = data.Items.map(i => Serializer.deserialize(i, scan.table));

										if (data.LastEvaluatedKey && (!is.number(options.Limit) || results.length < options.Limit)) {
											runScanRecursive(data.LastEvaluatedKey)
												.then((more) => {
													resolveCallback(results.concat(more));
												});
										} else {
											resolveCallback(results);
										}
									}
								});
							});
						});
					};

					return runScanRecursive();
				}).then((results) => {
					logger.debug('Ran [', scan.description, '] on [', scan.table.name + (scan.index ? '/ ' + scan.index.name : ''), '] and matched [', results.length ,'] results.');

					return results;
				});
		}

		/**
		 * Runs a query against a DynamoDB table (or index) and returns
		 * all the items matching the query.
		 *
		 * @public
		 * @param {Query} query
		 * @returns {Promise<Array<Object>>}
		 */
		query(query) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(query, 'query', Query, 'Query');

					checkReady.call(this);

					const options = query.toQuerySchema();

					const runQueryRecursive = (previous) => {
						return this._scheduler.backoff(() => {
							return promise.build((resolveCallback, rejectCallback) => {
								if (previous) {
									options.ExclusiveStartKey = previous;
								}

								this._dynamo.query(options, (error, data) => {
									if (error) {
										logger.error(error);

										rejectCallback('Failed to query DynamoDB table', error);
									} else {
										const results = data.Items.map(i => Serializer.deserialize(i, query.table));

										if (data.LastEvaluatedKey && (!is.number(options.Limit) || results.length < options.Limit)) {
											runQueryRecursive(data.LastEvaluatedKey)
												.then((more) => {
													resolveCallback(results.concat(more));
												});
										} else {
											resolveCallback(results);
										}
									}
								});
							});
						});
					};

					return runQueryRecursive();
				}).then((results) => {
					logger.debug('Ran [', query.description, '] on [', query.table.name + (query.index ? '/' + query.index.name : ''), '] and matched [', results.length ,'] results.');

					return results;
				});
		}

		/**
		 * Returns a new {@link TableBuilder} instance, suitable for use by the
		 * {@link DynamoProvider#createTable} function.
		 *
		 * @public
		 * @param {string} name - The (unqualified) name of the table.
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

			if (this._batches !== null) {
				this._batches.forEach((k, v) => v.dispose());
				this._batches = null;
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

	function getBatchPayload(tableName, serializedItems) {
		const payload = {
			RequestItems: { }
		};

		payload.RequestItems[tableName] = serializedItems;

		return payload;
	}

	const DYNAMO_RESULT = {
		SUCCESS: 'SUCCESS',
		FAILURE: 'FAILURE'
	};

	class DynamoError extends Enum {
		constructor(code, description, retryable) {
			super(code, description);

			this._retryable = retryable;
		}

		get retryable() {
			return this._retryable;
		}

		toString() {
			return `[DynamoError (code=${this._code})]`;
		}
	}

	const dynamoErrorThrottling = new DynamoError('ThrottlingException', 'Throttling Exception', true);
	const dynamoErrorThroughput = new DynamoError('ProvisionedThroughputExceededException', 'Provisioned Throughput Exceeded Exception', true);
	const dynamoErrorConditional = new DynamoError('ConditionalCheckFailedException', 'Conditional Check Failed Exception', false);

	return DynamoProvider;
})();