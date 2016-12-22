var log4js = require('log4js');

var object = require('common/lang/object');

var QueryProvider = require('./../QueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/HardcodeQueryProvider');

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