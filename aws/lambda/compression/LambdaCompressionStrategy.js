module.exports = (() => {
	'use strict';

	/**
	 * A compression strategy definition.
	 *
	 * @public
	 * @abstract
	 */
	class LambdaCompressionStrategy {
		constructor() {

		}

		/**
		 * Runs a compression strategy and responses (if success).
		 *
		 * @public
		 * @param {LambdaResponder} responder
		 * @param {Function} next
		 * @param {*} data
		 * @param {Number=} code
		 * @return {Promise<LambdaCompressionStrategyResult|null>}
		 */
		respond(responder, next, data, code) {
			return this._respond(responder, next, data, code);
		}

		/**
		 * @protected
		 * @abstract
		 * @param {LambdaResponder} responder
		 * @param {Function} next
		 * @param {*} data
		 * @param {Number=} code
		 * @return {Promise<LambdaCompressionStrategyResult|null>}
		 */
		_respond(responder, next, data, code) {
			return next();
		}

		toString() {
			return '[LambdaCompressionStrategy]';
		}
	}

	return LambdaCompressionStrategy;
})();
