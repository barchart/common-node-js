const log4js = require('log4js'),
	zlib = require('zlib');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is'),
	promise = require('@barchart/common-js/lang/promise');

const LambdaEventParser = require('./../LambdaEventParser');

const LambdaResponseStrategy = require('./LambdaResponseStrategy');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/lambda/responses/LambdaResponseStrategyGzip');

	/**
	 * A strategy for compressing the response with the GZIP algorithm.
	 *
	 * @public
	 * @param {LambdaEventParser} parser
	 * @param {Object=} options
	 * @extends {LambdaResponseStrategy}
	 */
	class LambdaResponseStrategyGzip extends LambdaResponseStrategy {
		constructor(parser, options) {
			super();

			assert.argumentIsRequired(parser, 'parser', LambdaEventParser, 'LambdaEventParser');

			this._parser = parser;
			this._options = options || { };
		}

		_process(responder, response, responseSize, responseCode) {
			const acceptEncoding = this._parser.getHeader('Accept-Encoding');

			if (!(is.string(acceptEncoding) && acceptEncoding.includes('gzip'))) {
				logger.debug('Unable to compress response, the request header [ Accept-Encoding ] does not include the [ gzip ] option');

				return false;
			}

			if (responseSize < LambdaResponseStrategy.MINIMUM_RESPONSE_SIZE_FOR_COMPRESSION_IN_BYTES) {
				logger.debug('Unable to compress response, the response size [', responseSize, '] is too small for compression to be useful');

				return false;
			}
			

			if (responseSize > LambdaResponseStrategy.MAXIMUM_RESPONSE_SIZE_FOR_COMPRESSION_IN_BYTES) {
				logger.debug('Unable to compress response, the uncompressed response size [', responseSize, '] is too large for compression to be useful');

				return false;
			}

			logger.debug('Response compression started, uncompressed size is [', responseSize, ']');

			return compress(response).then((compressed) => {
				const compressedSize = Buffer.byteLength(compressed, 'base64');

				if (compressedSize > LambdaResponseStrategy.MAXIMUM_RESPONSE_LENGTH_IN_BYTES) {
					logger.debug('Response compressed completed; however, the compressed response size [', compressedSize, '] exceeds the maximum response size [', LambdaResponseStrategy.MAXIMUM_RESPONSE_LENGTH_IN_BYTES, ']');

					return false;
				} else {
					logger.debug('Response compressed completed; compressed response size is [', compressedSize, ']');

					responder.setHeader('Content-Encoding', 'gzip');
					responder.sendBinary(compressed);

					return true;
				}
			});
		}

		toString() {
			return '[LambdaResponseStrategyGzip]';
		}
	}

	function compress(data) {
		return promise.build((resolve, reject) => {
			zlib.gzip(data, (error, compressed) => {
				if (error) {
					logger.error(error);

					reject(error);
				} else {
					resolve(compressed);
				}
			});
		});
	}

	return LambdaResponseStrategyGzip;
})();
