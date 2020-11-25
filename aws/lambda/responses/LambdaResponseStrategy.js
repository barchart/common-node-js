const log4js = require('log4js');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/lambda/responses/LambdaResponseStrategyForDefault');

	const MAXIMUM_RESPONSE_LENGTH_IN_BYTES =  5 * 1024 * 1024;

	const MINIMUM_RESPONSE_SIZE_FOR_COMPRESSION_IN_BYTES = 1 * 1024;
	const MAXIMUM_RESPONSE_SIZE_FOR_COMPRESSION_IN_BYTES = 50 * 1024 * 1024;

	/**
	 * A strategy for generating the response of a Lambda Function.
	 *
	 * @public
	 * @abstract
	 */
	class LambdaResponseStrategy {
		constructor() {

		}

		/**
		 * Processes the response strategy, returns true if a response was generated.
		 *
		 * @public
		 * @param {LambdaResponder} responder
		 * @param {String} response
		 * @param {Number} responseSize
		 * @param {Number=} responseCode
		 * @returns {Promise<Boolean>}
		 */
		process(responder, response, responseSize, responseCode) {
			return Promise.resolve()
				.then(() => {
					return this._process(responder, response, responseSize, responseCode);
				});
		}

		/**
		 * @protected
		 * @abstract
		 * @param {LambdaResponder} responder
		 * @param {String} response
		 * @param {Number} responseSize
		 * @param {Number=} responseCode
		 * @returns {Promise<Boolean>|Boolean}
		 */
		_process(responder, response, responseSize, responseCode) {
			return false;
		}

		/**
		 * A simple response strategy.
		 *
		 * @public
		 * @static
		 * @returns {LambdaResponseStrategy}
		 */
		static get DEFAULT_STRATEGY() {
			return new LambdaResponseStrategyDefault();
		}

		/**
		 * The maximum size of a response, in bytes.
		 *
		 * @public
		 * @static
		 * @returns {Number}
		 */
		static get MAXIMUM_RESPONSE_LENGTH_IN_BYTES() {
			return MAXIMUM_RESPONSE_LENGTH_IN_BYTES;
		}

		/**
		 * The minimum size, in bytes, for response compression to be considered.
		 *
		 * @public
		 * @static
		 * @returns {Number}
		 */
		static get MINIMUM_RESPONSE_SIZE_FOR_COMPRESSION_IN_BYTES() {
			return MINIMUM_RESPONSE_SIZE_FOR_COMPRESSION_IN_BYTES;
		}

		/**
		 * The maximum size, in bytes, for response compression to be considered.
		 *
		 * @public
		 * @static
		 * @returns {Number}
		 */
		static get MAXIMUM_RESPONSE_SIZE_FOR_COMPRESSION_IN_BYTES() {
			return MAXIMUM_RESPONSE_SIZE_FOR_COMPRESSION_IN_BYTES;
		}


		toString() {
			return '[LambdaResponseStrategy]';
		}
	}

	class LambdaResponseStrategyDefault extends LambdaResponseStrategy {
		constructor() {
			super();
		}

		_process(responder, response, responseSize, responseCode) {
			const data = { };

			if (responseSize > LambdaResponseStrategy.MAXIMUM_RESPONSE_LENGTH_IN_BYTES) {
				logger.error(`Unable to process response, response byte size [ ${responseSize} ] exceeds byte limit [ ${LambdaResponseStrategy.MAXIMUM_RESPONSE_LENGTH_IN_BYTES} ]`);

				data.statusCode = 413;
				data.body = JSON.stringify({ message: 'Response too large' });
			} else {
				data.statusCode = responseCode || 200;
				data.body = response;
				data.headers = responder.headers;
			}

			responder.sendRaw(data);

			return true;
		}

		toString() {
			return '[LambdaResponseStrategyDefault]';
		}
	}

	return LambdaResponseStrategy;
})();
