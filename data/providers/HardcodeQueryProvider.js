var log4js = require('log4js');

var is = require('common/lang/is');

var QueryProvider = require('./../QueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/HardcodeQueryProvider');

	class HardcodeQueryProvider extends QueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_runQuery(criteria) {
			return clone(this._getConfiguration().results)
		}

		toString() {
			return '[HardcodeQueryProvider]';
		}
	}

	function clone(target) {
		let c = { };

		if (is.array(target)) {
			c = target.map((targetItem) => {
				return clone(targetItem);
			});
		} else if (is.object(target)) {
			const keys = Object.keys(target);

			c = keys.reduce((accumulator, key) => {
				accumulator[key] = clone(target[key]);

				return accumulator;
			}, { });
		} else {
			c = target;
		}

		return c;
	}

	return HardcodeQueryProvider;
})();