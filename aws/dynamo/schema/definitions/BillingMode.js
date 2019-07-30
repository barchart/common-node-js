const Enum = require('@barchart/common-js/lang/Enum');

module.exports = (() => {
	'use strict';

	/**
	 * Defines billing mode for table.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 * @param {String} description
	 */
	class BillingMode extends Enum {
		constructor(code, description) {
			super(code, description);
		}

		/**
		 * PROVISIONED.
		 *
		 * @static
		 * @return {BillingMode}
		 */
		static get PROVISIONED() {
			return provisioned;
		}

		/**
		 * PAY PER REQUEST.
		 *
		 * @static
		 * @return {BillingMode}
		 */
		static get PAY_PER_REQUEST() {
			return payPerRequest;
		}

		toString() {
			return `[BillingMode (code=${this.code})]`;
		}
	}

	const provisioned = new BillingMode('PROVISIONED', 'Provisioned');
	const payPerRequest = new BillingMode('PAY_PER_REQUEST', 'Pay per request');

	return BillingMode;
})();
