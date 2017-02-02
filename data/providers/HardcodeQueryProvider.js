var log4js = require('log4js');

var object = require('common/lang/object');

var QueryProvider = require('./../QueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/HardcodeQueryProvider');

	/**
	 * A {@link QueryProvider} query provider that returns a
	 * clone of a configuration object.
	 *
	 * @public
	 * @interface
	 * @param {Object} configuration
	 * @param {Object} configuration.results - The object to clone and return.
	 */
	class HardcodeQueryProvider extends QueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_runQuery(criteria) {
			return object.clone(this._getConfiguration().results);
		}

		toString() {
			return '[HardcodeQueryProvider]';
		}
	}

	return HardcodeQueryProvider;
})();