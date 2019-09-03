const FailureType = require('@barchart/common-js/api/failures/FailureType');

module.exports = (() => {
	'use strict';

	/**
	 * A static container for lambda-specific {@link FailureType} items.
	 *
	 * @public
	 */
	class LambdaFailureType {
		constructor() {

		}

		/**
		 * The Lambda function aborted processing.
		 *
		 * @public
		 * @static
		 * @returns {FailureType}
		 */
		static get LAMBDA_INVOCATION_SUPPRESSED() {
			return lambdaInvocationSuppressed;
		}

		toString() {
			return '[PortfolioFailureType]';
		}
	}

	const lambdaInvocationSuppressed = new FailureType('LAMBDA_INVOCATION_SUPPRESSED', 'Processing of this operation was suppressed.', false);

	return LambdaFailureType;
})();
