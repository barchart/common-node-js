const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	object = require('@barchart/common-js/lang/object');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/SecretsManagerProvider');

	/**
	 * A facade for Amazon's Secrets Manager. The constructor
	 * accepts configuration options. The promise-based instance functions
	 * abstract knowledge of the AWS API.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.region - The AWS region (e.g. "us-east-1").
	 * @param {string=} configuration.apiVersion - The Secrets Manager version (defaults to "2017-10-17").
	 */
	class SecretsManagerProvider extends Disposable {
		constructor(configuration) {
			super(configuration);

			assert.argumentIsRequired(configuration, 'configuration', Object);
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._sm = null;

			this._configuration = configuration;

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
				return Promise.reject('The Secrets Manager Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({ region: this._configuration.region });

						this._sm = new aws.SecretsManager({ apiVersion: this._configuration.apiVersion || '2017-10-17' });
					}).then(() => {
						logger.info('Secrets Manager provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('Secrets Manager provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		/**
		 * Gets a secret value.
		 *
		 * @public
		 * @param {String} secretId
		 * @return {Promise<SecretsManager.GetSecretValueResponse>}
		 */
		getSecretValue(secretId) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(secretId, 'secretId', String);

					checkReady.call(this);

					const params = { };

					params.SecretId = secretId;

					return this._sm.getSecretValue(params).promise()
						.catch((err) => {
							logger.error(`SecretsManager Provider failed to get secret [ ${secretId} ]`);

							return Promise.reject(err);
						});
				});
		}

		_onDispose() {
			logger.debug('SecretsManager provider disposed');
		}

		toString() {
			return '[SecretsManagerProvider]';
		}
	}

	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The SecretsManager Provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The SecretsManager Provider has not been started.');
		}
	}

	return SecretsManagerProvider;
})();
