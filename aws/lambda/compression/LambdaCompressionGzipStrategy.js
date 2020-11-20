const log4js = require('log4js'),
	zlib = require('zlib');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is'),
	promise = require('@barchart/common-js/lang/promise');

const LambdaEventParser = require('./../LambdaEventParser');

const LambdaCompressionStrategy = require('./LambdaCompressionStrategy');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/lambda/compression/LambdaCompressionGzipStrategy');

	const MINIMUM_COMPRESSION_SIZE_BYTES = 1024;
	const MAXIMUM_COMPRESSION_SIZE_BYTES = 50 * 1024 * 1024;
	const MAXIMUM_COMPRESSED_SIZE_BYTES = 5 * 1024 * 1024;

	/**
	 * A strategy for GZIP compression. Requires 'Accept-Encoding'
	 * header to be sent from the client.
	 *
	 * @public
	 * @extends {LambdaCompressionStrategy}
	 */
	class LambdaCompressionGzipStrategy extends LambdaCompressionStrategy {
		constructor(parser, minimumCompressionSize) {
			super();

			assert.argumentIsRequired(parser, 'parser', LambdaEventParser, 'LambdaEventParser');
			assert.argumentIsOptional(minimumCompressionSize, 'minimumCompressionSize', Number);

			this._parser = parser;
			this._minimumCompressionSize = is.number(minimumCompressionSize) ? minimumCompressionSize : MINIMUM_COMPRESSION_SIZE_BYTES;
		}

		_respond(responder, next, data, code) {
			assert.argumentIsRequired(responder, 'responder', Object);
			assert.argumentIsRequired(next, 'next', Function);

			const acceptEncoding = this._parser.getHeader('Accept-Encoding');

			if (!is.string(acceptEncoding) || !acceptEncoding.includes('gzip')) {
				logger.debug('Compression skipped. Request doesn\'t contain appropriate header');

				return next();
			}

			if (!is.string(data)) {
				logger.debug('Compression skipped. Provided response is not a string');

				return next();
			}

			if (data.length < this._minimumCompressionSize) {
				logger.debug(`Compression skipped. Response size [ ${bytesToKilobytes(data.length)} KB ] is smaller than minimum compression size [ ${bytesToKilobytes(this._minimumCompressionSize)} KB ]`);

				return next();
			}

			if (data.length > MAXIMUM_COMPRESSION_SIZE_BYTES) {
				logger.debug(`Compression skipped. Response size [ ${bytesToKilobytes(data.length)} KB ] is bigger than maximum compression size [ ${bytesToKilobytes(MAXIMUM_COMPRESSION_SIZE_BYTES)} KB ]`);

				return next();
			}

			return Promise.resolve()
				.then(() => {
					logger.debug('Starting the response compression');

					return promise.build((resolve, reject) => {
						zlib.gzip(data, (error, compressed) => {
							if (error) {
								logger.error(error);

								reject(error);

								return;
							}

							resolve(compressed.toString('base64'));
						});
					});
				}).then((compressed) => {
					const compressedSize = Buffer.byteLength(compressed, 'base64');

					if (compressedSize > MAXIMUM_COMPRESSED_SIZE_BYTES) {
						logger.debug(`Responding skipped. Compressed response size [ ${bytesToKilobytes(compressedSize)} KB ] is bigger than maximum allowed size [ ${bytesToKilobytes(MAXIMUM_COMPRESSED_SIZE_BYTES)} ] KB`);

						return next();
					}

					logger.info(`Response compression completed. Base64 encoded body size is [ ${bytesToKilobytes(compressedSize)} KB ]`);

					const response = { };

					response.statusCode = code || 200;
					response.body = compressed;
					response.isBase64Encoded = true;
					response.headers = responder.headers;

					delete response.headers['Content-Type'];
					response.headers['Content-Encoding'] = 'gzip';

					responder.sendRaw(response, null);

					return { done: true };
				});
		}

		toString() {
			return '[LambdaCompressionGzipStrategy]';
		}
	}

	function bytesToKilobytes(len) {
		return (len / 1024).toFixed(2);
	}

	return LambdaCompressionGzipStrategy;
})();
