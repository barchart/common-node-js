var log4js = require('log4js');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/QueryProvider');

	/**
	 * Used by a {@link DataProvider} to generate data.
	 *
	 * @public
	 * @interface
	 * @param {object} configuration - Used by inheriting class.
	 */
	class QueryProvider {
		constructor(configuration) {
			this._configuration = configuration || {};
		}

		_getConfiguration() {
			return this._configuration;
		}

		runQuery(criteria) {
			if (!this.getCriteriaIsValid(criteria)) {
				throw new Error('Unable to run query, the query parameters are invalid.');
			}

			return Promise.resolve()
				.then(() => {
					return this._runQuery(criteria);
				});
		}

		_runQuery(criteria) {
			return null;
		}

		getCriteriaIsValid(criteria) {
			return this._getCriteriaIsValid(criteria);
		}

		_getCriteriaIsValid(criteria) {
			return true;
		}

		toString() {
			return '[QueryProvider]';
		}
	}

	return QueryProvider;
})();