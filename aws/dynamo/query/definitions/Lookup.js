module.exports = (() => {
	'use strict';

	/**
	 * The base class for a object which defines how to lookup
	 * data in a DynamoDB table.
	 *
	 * @public
	 * @interface
	 */
	class Lookup {
		constructor() {

		}

		/**
		 * The targeted {@Table}.
		 *
		 * @returns {null}
		 */
		get table() {
			return null;
		}

		toString() {
			return '[Lookup]';
		}
	}

	return Lookup;
})();