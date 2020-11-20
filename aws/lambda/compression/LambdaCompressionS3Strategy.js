const process = require('process');

const log4js = require('log4js'),
	uuid = require('uuid');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const LambdaHelper = require('./../LambdaHelper');

const LambdaCompressionStrategy = require('./LambdaCompressionStrategy');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/lambda/compression/LambdaCompressionS3Strategy');

	const SIGNED_URL_TTL_SECONDS = 60;
	const MINIMUM_COMPRESSION_SIZE_BYTES = 5 * 1024 * 1024;

	/**
	 * An S3 strategy for large responses. Response object
	 * will be put in S3 bucket. Then, signed url will be
	 * generated and returned as a target for redirection (HTTP 303 status code).
	 *
	 * @public
	 * @extends {LambdaCompressionStrategy}
	 */
	class LambdaCompressionS3Strategy extends LambdaCompressionStrategy {
		constructor(minimumCompressionSize) {
			super();

			assert.argumentIsOptional(minimumCompressionSize, 'minimumCompressionSize', Number);

			this._minimumCompressionSize = is.number(minimumCompressionSize) ? minimumCompressionSize : MINIMUM_COMPRESSION_SIZE_BYTES;
			this._folder = process.env.AWS_LAMBDA_FUNCTION_NAME || null;
		}

		_respond(responder, next, data, code) {
			assert.argumentIsRequired(responder, 'responder', Object);
			assert.argumentIsRequired(next, 'next', Function);

			if (!is.string(data)) {
				logger.debug('Compression skipped. Provided response is not a string');

				return next();
			}

			if (data.length < this._minimumCompressionSize) {
				logger.debug(`Compression skipped. Response size [ ${bytesToKilobytes(data.length)} KB ] is smaller than minimum compression size [ ${bytesToKilobytes(this._minimumCompressionSize)} KB ]`);

				return next();
			}

			let key = uuid.v4();

			if (this._folder !== null) {
				key = `${this._folder}/${key}`;
			}

			logger.debug('Starting the response compression');

			return Promise.resolve({ })
				.then((context) => {
					logger.debug('Initializing S3Provider');

					return LambdaHelper.getS3ProviderForResponse()
						.then((s3) => {
							logger.info('S3Provider initialized');

							context.s3 = s3;

							return context;
						}).catch((error) => {
							logger.error(error);

							context.skip = true;

							return context;
						});
				}).then((context) => {
					if (context.skip) {
						return context;
					}

					const mimeType = responder.headers['Content-Type'] || null;

					logger.debug(`Uploading object [ ${key} ] to S3 with [ ${mimeType || 'application/json'} ] mime type`);

					return context.s3.upload(key, data, mimeType, true)
						.then(() => {
							logger.info(`Uploaded object [ ${key} ] to S3 with [ ${mimeType || 'application/json'} ] mime type`);

							return context;
						}).catch((error) => {
							logger.error(error);

							context.skip = true;

							return context;
						});
				}).then((context) => {
					if (context.skip) {
						return context;
					}

					logger.debug(`Getting signed url for the uploaded object [ ${key} ]`);

					return context.s3.getSignedUrl('getObject', key, SIGNED_URL_TTL_SECONDS)
						.then((url) => {
							logger.info(`Got signed url for the uploaded object [ ${key} ]`);

							context.signedUrl = url;

							return context;
						}).catch((error) => {
							logger.error(error);

							context.skip = true;

							return context;
						});
				}).then((context) => {
					if (context.skip) {
						logger.debug('Compression skipped. Previous operation failed');

						return next();
					}

					logger.info(`Response compression completed. Body size is [ ${bytesToKilobytes(data.length)} KB ]`);

					const response = { };

					response.statusCode = code || 303;

					response.headers = responder.headers;
					response.headers.Location = context.signedUrl;

					responder.sendRaw(response, null);

					return { done: true };
				});
		}

		toString() {
			return '[LambdaCompressionS3Strategy]';
		}
	}

	function bytesToKilobytes(len) {
		return (len / 1024).toFixed(2);
	}

	return LambdaCompressionS3Strategy;
})();
