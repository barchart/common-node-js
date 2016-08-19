var log4js = require('log4js');

var QueryProvider = require('./../QueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/HardcodeQueryProvider');

	class HardcodeQueryProvider extends QueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_runQuery(criteria) {
			return Object.assign({ }, this._getConfiguration().results);
		}

		toString() {
			return '[HardcodeQueryProvider]';
		}
	}

	return HardcodeQueryProvider;
})();