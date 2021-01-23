const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	is = require('@barchart/common-js/lang/is'),
	promise = require('@barchart/common-js/lang/promise');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/CloudWatchLogsProvider');

	/**
	 * A facade for Amazon's CloudWatchLogs Service. The constructor
	 * accepts configuration options. The promise-based instance functions
	 * abstract knowledge of the AWS API.
	 *
	 * @public
	 * @extends {Disposable}
	 * @param {object} configuration
	 * @param {String} configuration.region - The AWS region (e.g. "us-east-1").
	 * @param {String=} configuration.apiVersion - The CloudWatchLogs version (defaults to "2014-03-28").
	 */
	class CloudWatchLogsProvider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._configuration = configuration;

			this._cloudWatchLogs = null;

			this._startPromise = null;
			this._started = false;
		}

		/**
		 * Connects to Amazon. Must be called once before using other instance
		 * functions.
		 *
		 * @public
		 * @returns {Promise<Boolean>}
		 */
		start() {
			if (this.getIsDisposed()) {
				return Promise.reject('The CloudWatchLogs Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._cloudWatchLogs = new aws.CloudWatchLogs({apiVersion: this._configuration.apiVersion || '2014-03-28'});
					}).then(() => {
						logger.info('CloudWatchLogs provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('CloudWatchLogs provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		/**
		 * Starts a query.
		 *
		 * @public
		 * @param {String} name - The name of log group to query.
		 * @param {String} query - The query string.
		 * @param {Number} startTime - The beginning of the time range to query. The number of seconds since January 1, 1970, 00:00:00 UTC.
		 * @param {Number} endTime - The end of the time range to query. The number of seconds since January 1, 1970, 00:00:00 UTC.
		 * @param {Number=} limit - The maximum number of log events to return in the query.
		 * @returns {Promise<Object>}
		 */
		startQuery(name, query, startTime, endTime, limit) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(name, 'name', String);
					assert.argumentIsRequired(query, 'query', String);
					assert.argumentIsRequired(startTime, 'startTime', Number);
					assert.argumentIsRequired(endTime, 'endTime', Number);
					assert.argumentIsOptional(limit, 'limit', Number);

					checkReady.call(this);

					return promise.build((resolve, reject) => {
						const params = {
							logGroupName: name,
							queryString: query,
							startTime: startTime,
							endTime: endTime,
							limit: limit
						};

						this._cloudWatchLogs.startQuery(params, (err, data) => {
							if (err) {
								logger.error(`CloudWatchLogs Provider failed to start query for [ ${name} ]`);
								logger.error(err);

								reject(err);
							} else {
								logger.debug(`Query [ ${name} ] started`);

								resolve(data);
							}
						});
					});
				});
		}

		/**
		 * Gets a result for query.
		 *
		 * @public
		 * @param {String} queryId - The identifier returned from {@link CloudWatchLogsProvider#startQuery}
		 * @returns {Promise<Object>}
		 */
		getQueryResults(queryId) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(queryId, 'queryId', String);

					checkReady.call(this);

					return promise.build((resolve, reject) => {
						this._cloudWatchLogs.getQueryResults({ queryId: queryId }, (err, data) => {
							if (err) {
								logger.error(err);

								reject(err);
							} else {
								resolve(data);
							}
						});
					});
				});
		}

		/**
		 * Lists the specified log groups by prefix.
		 *
		 * @public
		 * @param {String} logGroupNamePrefix
		 * @returns {Promise<Object>}
		 */
		describeLogGroups(logGroupNamePrefix) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(logGroupNamePrefix, 'logGroupNamePrefix', String);

					checkReady.call(this);

					return promise.build((resolve, reject) => {
						this._cloudWatchLogs.describeLogGroups({ logGroupNamePrefix: logGroupNamePrefix }, (err, data) => {
							if (err) {
								logger.error(err);

								reject(err);
							} else {
								resolve(data);
							}
						});
					});
				});
		}

		/**
		 * Indicates if the log group has at least one log stream.
		 *
		 * @public
		 * @string {String} logGroupName
		 * @returns {Promise<Boolean>}
		 */
		getLogStreamExists(logGroupName) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(logGroupName, 'logGroupName', String);

					checkReady.call(this);

					return describeLogStreams.call(this, logGroupName, 1)
						.then((results) => {
							return results.logStreams.length !== 0;
						}).catch((e) => {
							return false;
						});
				});
		}

		_onDispose() {
			logger.debug('CloudWatchLogs provider disposed');
		}

		toString() {
			return '[CloudWatchLogsProvider]';
		}
	}

	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The CloudWatchLogs Provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The CloudWatchLogs Provider has not been started.');
		}
	}

	function describeLogStreams(logGroupName, limit) {
		return promise.build((resolve, reject) => {
			const payload = { };

			payload.logGroupName = logGroupName;

			if (is.integer(limit)) {
				payload.limit = limit;
			}

			this._cloudWatchLogs.describeLogStreams(payload, (err, data) => {
				if (err) {
					logger.error(err);

					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	return CloudWatchLogsProvider;
})();
