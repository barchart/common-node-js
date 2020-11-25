const process = require('process');

const log4js = require('log4js'),
	uuid = require('uuid');

const S3Provider = require('./../../S3Provider');

const LambdaResponseStrategy = require('./LambdaResponseStrategy');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/lambda/responses/LambdaResponseStrategyForS3');

	const S3_TTL_FOR_SIGNED_URL_IN_SECONDS = 60;

	/**
	 * A strategy for very large responses. The actual response is written to S3 and
	 * an HTTP 303 (see other) response is sent. This allows the client to load the
	 * actual response from S3.
	 *
	 * @public
	 * @extends {LambdaResponseStrategy}
	 * @param {Object} options
	 */
	class LambdaResponseStrategyForS3 extends LambdaResponseStrategy {
		constructor(options) {
			super();

			this._options = options || { };
		}

		_process(responder, response, responseSize, responseCode) {
			if (responseSize < LambdaResponseStrategy.MAXIMUM_RESPONSE_LENGTH_IN_BYTES) {
				logger.debug('Unable to use S3 response strategy, the response size [', responseSize, '] is too small');

				return false;
			}

			const folder = this._options.folder || process.env.AWS_LAMBDA_FUNCTION_NAME;
			const key = `${folder}/${uuid.v4()}`;

			logger.debug('Uploading response data to S3, the response size is [', responseSize, ']');

			return Promise.resolve({ })
				.then((context) => {
					return getS3Provider()
						.then((s3) => {
							logger.debug('S3 provider initialized');

							context.s3 = s3;

							return context;
						});
				}).then((context) => {
					const mimeType = responder.headers['Content-Type'] || null;

					return context.s3.upload(key, response, mimeType, true)
						.then(() => {
							logger.debug('Uploaded response data to S3 at [', key, ']');

							return context;
						});
				}).then((context) => {
					return context.s3.getSignedUrl('getObject', key, S3_TTL_FOR_SIGNED_URL_IN_SECONDS)
						.then((url) => {
							logger.debug('Retrieved signed URL for response data at [', key, ']');

							context.signedUrl = url;

							return context;
						});
				}).then((context) => {
					logger.info('Response uploaded to S3, sending HTTP 303 response referring to S3 object at [', key, ']');

					const response = { };

					response.statusCode = 303;

					response.headers = responder.headers;
					response.headers.Location = context.signedUrl;

					responder.sendRaw(response, null);

					return true;
				}).catch((error) => {
					logger.error('Failed to upload response data to S3', error);

					return false;
				});
		}

		toString() {
			return '[LambdaResponseStrategyForS3]';
		}
	}

	let s3ProviderPromise = null;

	function getS3Provider() {
		if (s3ProviderPromise === null) {
			s3ProviderPromise = Promise.resolve()
				.then(() => {
					const provider = new S3Provider({ region: 'us-east-1', bucket: 'barchart-aws-lambda-responses' });

					return provider.start().then(() => provider);
				});
		}

		return s3ProviderPromise;
	}

	return LambdaResponseStrategyForS3;
})();
