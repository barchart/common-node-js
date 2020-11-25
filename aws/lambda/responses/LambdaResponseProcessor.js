const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	promise = require('@barchart/common-js/lang/promise');

const LambdaResponseStrategy = require('./LambdaResponseStrategy');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/lambda/responses/LambdaResponseProcessor');

	/**
	 * Generates the response for a Lambda Function by iterating through an
	 * ordered list of {@link LambdaResponseStrategy} instances until one 
	 * can successfully generate a response.
	 *
	 * @public
	 */
	class LambdaResponseProcessor {
		constructor() {
			this._strategies = [ ];
		}

		/**
		 * Adds a custom {@link LambdaResponseStrategy}. Strategies will be
		 * processed in the order they are added. The first successful strategy
		 * will be used to generate the response. Subsequent strategies will be
		 * ignored.
		 *
		 * @public
		 * @param {LambdaResponseStrategy} strategy
		 */
		addResponseStrategy(strategy) {
			assert.argumentIsRequired(strategy, 'strategy', LambdaResponseStrategy, 'LambdaResponseStrategy');

			this._strategies.push(strategy);
		}

		/**
		 * Runs strategies in a sequential order while one of
		 * them won't return not null result.
		 *
		 * @public
		 * @param {LambdaResponder} responder
		 * @param {String} response
		 * @param {Number=} responseCode
		 * @returns {Promise}
		 */
		process(responder, response, responseCode) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(response, 'response', String);
					assert.argumentIsOptional(responseCode, 'responseCode', Number);

					const strategies = this._strategies.slice(0);
					strategies.push(LambdaResponseStrategy.DEFAULT_STRATEGY);

					const responseSize = Buffer.byteLength(response);

					return promise.first(strategies.map((strategy) => {
						logger.debug('Attempting to process response using [', strategy, ']');

						return strategy.process(responder, response, responseSize, responseCode)
							.then((success) => {
								if (success) {
									logger.info('Processed response using [', strategy, ']');

									return true;
								} else {
									return null;
								}
							});
					}));
				});
		}

		toString() {
			return '[LambdaResponseProcessor]';
		}
	}

	return LambdaResponseProcessor;
})();
