var log4js = require('log4js');

var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FirstResultProcessor');

	class FirstResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			let result;

			if (is.array(results)) {
				if (results.length !== 0) {
					result = results[0];
				} else {
					result = undefined;
				}
			} else {
				result = results;
			}

			return result;
		}

		toString() {
			return '[FirstResultProcessor]';
		}
	}

	return FirstResultProcessor;
})();