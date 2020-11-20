const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert');

const LambdaCompressionStrategy = require('./LambdaCompressionStrategy'),
	LambdaCompressionEmptyStrategy = require('./LambdaCompressionEmptyStrategy');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/lambda/compression/LambdaCompressionController');

	/**
	 * A controller for running single/multiple compression strategy(-ies).
	 *
	 * @public
	 */
	class LambdaCompressionController {
		constructor() {
			this._strategies = [ ];
		}

		/**
		 * Adds a {@link LambdaCompressionStrategy} to the strategies pull.
		 *
		 * @public
		 * @param {LambdaCompressionStrategy} strategy
		 * @returns {LambdaCompressionController}
		 */
		add(strategy) {
			assert.argumentIsRequired(strategy, 'strategy', LambdaCompressionStrategy, 'LambdaCompressionStrategy');

			this._strategies.push(strategy);

			return this;
		}

		/**
		 * Runs strategies in a sequential order while one of
		 * them won't return not null result.
		 *
		 * @public
		 * @param {LambdaResponder} responder
		 * @param {*} data
		 * @param {Number=} code
		 * @return {Promise<LambdaCompressionStrategyResult|null>}
		 */
		respond(responder, data, code) {
			const next = () => {
				return Promise.resolve(null);
			};

			const strategies = this._strategies.slice(0);

			strategies.push(LambdaCompressionEmptyStrategy.INSTANCE);

			logger.debug(`Applying response strategies [ ${strategies.map(s => s.toString()).join(' ')} ]`);

			return strategies.reduce((previous, strategy) => {
				return previous.then((result) => {
					if (result === null) {
						return strategy.respond(responder, next, data, code)
							.then((r) => {
								if (r !== null) {
									logger.info(`Responded by ${strategy.toString()} strategy`);
								}

								return r;
							});
					} else {
						return previous;
					}
				});
			}, Promise.resolve(null));
		}

		toString() {
			return '[LambdaCompressionController]';
		}
	}

	return LambdaCompressionController;
})();
