module.exports = (() => {
	'use strict';

	/**
	 * The data access mechanism for a {@link DataOperation}. This is intended
	 * to be short-lived and may cache objects not yet written to the underlying
	 * data store.
	 *
	 * @public
	 * @interface
	 */
	class DataProvider {
		constructor() {

		}

		toString() {
			return '[DataProvider]';
		}
	}

	return DataProvider;
})();
