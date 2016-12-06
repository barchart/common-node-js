var aws = require('aws-sdk');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/S3Provider');

	class S3Provider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._s3 = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;
		}

		start() {
			if (this.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._s3 = new aws.S3({apiVersion: this._configuration.apiVersion || '2010-12-01'});
					}).then(() => {
						logger.info('S3 provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('S3 provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		getBucketContents(bucket) {
			if (this.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The S3 Provider has not been started.');
			}

			return new Promise((resolveCallback, rejectCallback) => {
				this._s3.listObjects({Bucket: bucket}, (err, data) => {
					if (err) {
						logger.error('S3 failed to retrieve contents: ', err);
						rejectCallback(err);
					} else {
						resolveCallback({
							content: data.Contents
						});
					}
				});
			});
		}

		uploadObject(bucket, fileName, buffer, mimeType) {
			if (this.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The S3 Provider has not been started.');
			}

			return new Promise((resolveCallback, rejectCallback) => {
				const params = {
					Bucket: bucket,
					Key: fileName,
					ACL: 'public-read',
					Body: buffer,
					ContentType: mimeType
				};

				const options = {
					partSize: 10 * 1024 * 1024,
					queueSize: 1
				};

				this._s3.upload(params, options, (err, data) => {
					if (err) {
						logger.error('S3 failed to upload object: ', err);
						rejectCallback(err);
					} else {
						resolveCallback({data: data});
					}
				});
			});
		}

		deleteObject(bucket, key) {
			if (this.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The S3 Provider has not been started.');
			}

			return new Promise((resolveCallback, rejectCallback) => {
				const params = {
					Bucket: bucket,
					Key: key
				};

				this._s3.deleteObject(params, (err, data) => {
					if (err) {
						logger.error('S3 failed to delete object: ', err);
						rejectCallback(err);
					} else {
						resolveCallback({data: data});
					}
				});
			});
		}

		_onDispose() {
			logger.debug('S3 provider disposed');
		}

		toString() {
			return '[S3Provider]';
		}
	}

	return S3Provider;
})();