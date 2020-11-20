const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const LambdaCompressionStrategy = require('./LambdaCompressionStrategy');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/lambda/compression/LambdaCompressionEmptyStrategy');

	const MAXIMUM_ALLOWED_RESPONSE_SIZE_BYTES = 5 * 1024 * 1024;

	/**
	 * A strategy that doesn't perform any compression and
	 * returns raw result if possible.
	 *
	 * @public
	 * @extends {LambdaCompressionStrategy}
	 */
	class LambdaCompressionEmptyStrategy extends LambdaCompressionStrategy {
		constructor() {
			super();
		}

		_respond(responder, next, data, code) {
			assert.argumentIsRequired(responder, 'responder', Object);
			assert.argumentIsRequired(next, 'next', Function);

			return Promise.resolve()
				.then(() => {
					const response = { };

					if (is.string(data) && data.length > MAXIMUM_ALLOWED_RESPONSE_SIZE_BYTES) {
						logger.error(`Response body size [ ${bytesToKilobytes(data.length)} KB ] is bigger than maximum allowed size [ ${bytesToKilobytes(MAXIMUM_ALLOWED_RESPONSE_SIZE_BYTES)} KB ]`);

						response.statusCode = 413;
						response.body = JSON.stringify({ message: 'Response too large' });
					} else {
						logger.info(`Responding without compression. Body size is [ ${bytesToKilobytes(data.length)} KB ]`);

						response.statusCode = code || 200;
						response.body = data;
						response.headers = responder.headers;
					}

					responder.sendRaw(response, null);

					return { done: true };
				});
		}

		/**
		 * A singleton.
		 *
		 * @public
		 * @static
		 * @returns {LambdaCompressionEmptyStrategy}
		 */
		static get INSTANCE() {
			if (instance === null) {
				instance = new LambdaCompressionEmptyStrategy();
			}

			return instance;
		}

		toString() {
			return '[LambdaCompressionEmptyStrategy]';
		}
	}

	let instance = null;

	function bytesToKilobytes(len) {
		return (len / 1024).toFixed(2);
	}

	return LambdaCompressionEmptyStrategy;
})();
