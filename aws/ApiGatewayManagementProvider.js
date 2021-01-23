const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/ApiGatewayManagementProvider');

	/**
	 * A facade for Amazon's Api Gateway Management. The constructor
	 * accepts configuration options. The promise-based instance functions
	 * abstract knowledge of the AWS API.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.region - The AWS region (e.g. "us-east-1").
	 * @param {string} configuration.endpoint - The endpoint url.
	 * @param {string=} configuration.apiVersion - The Api Gateway Management Api version (defaults to "2018-11-29").
	 *
	 */
	class ApiGatewayManagementProvider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration', Object);
			assert.argumentIsRequired(configuration.endpoint, 'configuration.endpoint', String);
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._configuration = configuration;

			this._agm = null;

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
				return Promise.reject('Unable to start, the ApiGatewayManagementProvider has been disposed');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
				.then(() => {
					this._agm = new aws.ApiGatewayManagementApi({
						apiVersion: this._configuration.apiVersion || '2018-11-29',
						endpoint: this._configuration.endpoint,
						region: this._configuration.region,
					});
				}).then(() => {
					logger.info('The ApiGatewayManagementProvider has started');

					this._started = true;

					return this._started;
				}).catch((e) => {
					logger.error('The ApiGatewayManagementProvider failed to start', e);

					throw e;
				});
			}

			return this._startPromise;
		}

		/**
		 * Sends data to provided connection.
		 *
		 * @param {String} connectionId
		 * @param {Buffer|String} data
		 * @returns {Promise}
		 */
		postToConnection(connectionId, data) {
			assert.argumentIsRequired(connectionId, 'connectionId', String);

			return this._agm.postToConnection({
				ConnectionId: connectionId,
				Data: data,
			}).promise();
		}

		toString() {
			return '[ApiGatewayManagementProvider]';
		}
	}

	return ApiGatewayManagementProvider;
})();
